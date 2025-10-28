import {
  Box,
  Card,
  Container,
  Flex,
  Heading,
  Section,
  Text,
  Theme,
} from "@radix-ui/themes";
import { NavBar } from "../../components/nav-bar";
import { Footer } from "../../components/footer";
import type { InferEntrySchema, RenderedContent } from "astro:content";
import { PAGE_DESCRIPTION } from "./constants";

type Props = {
  releases: {
    id: string;
    body?: string;
    collection: "releases";
    data: InferEntrySchema<"releases">;
    rendered?: RenderedContent;
  }[];
};

function Content({ releases }: Props) {
  return (
    <Theme className="relative" accentColor="gray">
      <NavBar />
      <Box>
        <Section
          size={{
            initial: "3",
            sm: "4",
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
            <Flex direction="column" gap="7">
              <Flex
                direction="column"
                gap={{
                  initial: "4",
                }}
                align="start"
              >
                <Heading
                  as="h1"
                  size={{
                    initial: "8",
                  }}
                >
                  Releases
                </Heading>
                <Text size="4" color="gray">
                  {PAGE_DESCRIPTION}
                </Text>
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
            <Flex direction="column" gap="6">
              {releases.map((release) => {
                return (
                  <Card
                    asChild
                    key={release.id}
                    size={{
                      initial: "2",
                      sm: "4",
                    }}
                  >
                    <a href={`/releases/${release.id}`}>
                      <Flex direction="column" gap="2">
                        <Text size="6" weight="bold">
                          {release.data.title}
                        </Text>

                        <Text size="2" color="gray">
                          {release.data.pubDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>

                        <Text size="3">{release.data.description}</Text>
                      </Flex>
                    </a>
                  </Card>
                );
              })}
            </Flex>
          </Container>
        </Section>
      </Box>
      <Footer />
    </Theme>
  );
}

export default Content;
