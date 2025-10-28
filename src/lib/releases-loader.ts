import type { Loader } from "astro/loaders";

// Base response from GitHub Contents API: GET /repos/:owner/:repo/contents/:path
// When path is a directory, returns array of GitHubContent
// When path is a file, returns single GitHubContent with additional content/encoding fields
interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: "file" | "dir" | "symlink" | "submodule";
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

// Extended response when getting a file's content (includes content field)
interface GitHubFileContent extends GitHubContent {
  content: string;
  encoding: "base64";
}

// Response from GitHub Commits API
interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

export function releasesLoader(): Loader {
  return {
    name: "releases-loader",
    load: async ({ store, logger, renderMarkdown }) => {
      logger.info("Fetching release notes from GitHub...");

      const githubAccessToken = import.meta.env.GITHUB_ACCESS_TOKEN;
      const headers: HeadersInit = {};

      if (githubAccessToken) {
        headers.Authorization = `Bearer ${githubAccessToken}`;
        logger.info("Using authenticated GitHub API requests");
      } else {
        logger.warn(
          "No GITHUB_TOKEN found. Using unauthenticated requests (60/hour rate limit)"
        );
      }

      try {
        // Fetch directory listing
        const releasesResponse = await fetch(
          "https://api.github.com/repos/kiwinight/standup-kiwi/contents/docs/releases",
          { headers }
        );

        if (!releasesResponse.ok) {
          throw new Error(
            `Failed to fetch releases directory: ${releasesResponse.statusText}`
          );
        }

        const releasesData: GitHubContent[] = await releasesResponse.json();

        const releaseFiles = releasesData.filter(
          (content: GitHubContent) =>
            content.type === "file" && content.name.endsWith(".md")
        );

        logger.info(`Found ${releaseFiles.length} release files`);

        await Promise.all(
          releaseFiles.map(async (releaseFile) => {
            try {
              const releaseFileResponse = await fetch(releaseFile.url, {
                headers,
              });

              if (!releaseFileResponse.ok) {
                logger.warn(
                  `Failed to fetch ${releaseFile.name}: ${releaseFileResponse.statusText}`
                );
                return;
              }

              const releaseFileData: GitHubFileContent =
                await releaseFileResponse.json();

              // Fetch commit date for this file
              const commitsResponse = await fetch(
                `https://api.github.com/repos/kiwinight/standup-kiwi/commits?path=${releaseFileData.path}&per_page=1`,
                { headers }
              );

              let releaseDate = new Date();
              if (commitsResponse.ok) {
                const commits: GitHubCommit[] = await commitsResponse.json();
                if (commits.length > 0) {
                  releaseDate = new Date(commits[0].commit.author.date);
                }
              } else {
                logger.warn(
                  `Failed to fetch commit date for ${releaseFile.name}, using current date`
                );
              }

              // Decode base64 content
              const markdown = Buffer.from(
                releaseFileData.content,
                "base64"
              ).toString("utf-8");

              // Parse version from filename (e.g., "v0.9.0.md" -> "v0.9.0")
              const version = releaseFile.name.replace(".md", "");

              // Extract title and description from markdown
              const lines = markdown.split("\n");
              const titleLine = lines.find((line) => line.startsWith("# "));
              const title = titleLine ? titleLine.replace("# ", "") : version;

              // Find the first paragraph after the title (description)
              let description = "";
              let foundTitle = false;
              for (const line of lines) {
                if (line.startsWith("# ")) {
                  foundTitle = true;
                  continue;
                }
                if (foundTitle && line.trim() && !line.startsWith("#")) {
                  description = line.trim();
                  break;
                }
              }

              // Remove the title from the body since it's already in frontmatter
              const bodyWithoutTitle = lines
                .slice(lines.findIndex((line) => line.startsWith("# ")) + 1)
                .join("\n")
                .trim();

              logger.info(
                `Processing ${version}, body length: ${bodyWithoutTitle.length}`
              );

              // Render markdown to HTML using Astro's built-in processor
              const rendered = await renderMarkdown(bodyWithoutTitle);

              logger.info(
                `Rendered ${version}, html length: ${
                  rendered?.html?.length || 0
                }`
              );

              // Store the entry
              store.set({
                id: version,
                data: {
                  title,
                  description: description || `Release notes for ${version}`,
                  pubDate: releaseDate,
                  author: "Standup Kiwi Team",
                  githubUrl: releaseFileData.html_url,
                },
                body: bodyWithoutTitle,
                rendered,
              });

              logger.info(`Loaded ${version}`);
            } catch (error) {
              logger.warn(
                `Error processing ${releaseFile.name}: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
            }
          })
        );

        logger.info("Successfully loaded all release notes");
      } catch (error) {
        logger.error(
          `Failed to load releases: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        // Don't throw - allow graceful failure so dev server continues running
      }
    },
  };
}
