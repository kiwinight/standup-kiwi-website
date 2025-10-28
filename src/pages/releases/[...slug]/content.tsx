import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Section,
  Text,
  Theme,
} from "@radix-ui/themes";
import { NavBar } from "../../../components/nav-bar";
import { Footer } from "../../../components/footer";
import type { RenderedContent } from "astro:content";
import type { InferEntrySchema } from "astro:content";
import type { ReactNode } from "react";
import { ArrowLeftIcon, ExternalLinkIcon } from "@radix-ui/react-icons";

type Props = {
  release: {
    id: string;
    body?: string;
    collection: "releases";
    data: InferEntrySchema<"releases">;
    rendered?: RenderedContent;
  };
  children: ReactNode;
};

function Content({ release, children }: Props) {
  const changelogUrl = `https://github.com/kiwinight/standup-kiwi/releases/tag/${release.id}`;

  return (
    <Theme className="relative" accentColor="gray">
      <NavBar />
      <Box>
        <Section
          size={{
            initial: "3",
            sm: "4",
          }}
          pb={{
            initial: "24px",
            sm: "24px",
          }}
          className="relative"
        >
          <Container
            size={{
              sm: "2",
            }}
            px={{
              initial: "4",
            }}
          >
            <Flex direction="column" gap="6">
              <Flex direction="column" gap="4">
                <Flex>
                  <Button asChild variant="ghost" highContrast>
                    <a href={`/releases`}>
                      <ArrowLeftIcon />
                      Back to releases
                    </a>
                  </Button>
                </Flex>
                <Heading
                  as="h1"
                  size={{
                    initial: "8",
                  }}
                >
                  {release.data.title}
                </Heading>

                <Text size="3" color="gray">
                  Released on{" "}
                  {release.data.pubDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>

                <Flex asChild align="center" gap="1">
                  <Link href={release.data.githubUrl} target="_blank">
                    See original
                    <ExternalLinkIcon />
                  </Link>
                </Flex>
              </Flex>
            </Flex>
          </Container>
        </Section>

        <Section
          size={{
            initial: "3",
            sm: "4",
          }}
          pt="0"
          className="relative"
        >
          <Container
            size={{
              sm: "2",
            }}
            px={{
              initial: "4",
            }}
          >
            <Flex
              direction="column"
              gap={{
                initial: "5",
                sm: "6",
              }}
            >
              <Box className="prose max-w-none">{children}</Box>
            </Flex>
          </Container>
        </Section>
      </Box>
      <Footer />
    </Theme>
  );
}

export default Content;
