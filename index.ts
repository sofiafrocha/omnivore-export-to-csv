import { gql, GraphQLClient } from "graphql-request";

const key = Bun.env.API_KEY;
const client = new GraphQLClient("https://api-prod.omnivore.app/api/graphql", {
  headers: {
    authorization: key,
  },
});

const getArticles = gql`
  query Search(
    $after: String
    $first: Int
    $query: String
    $includeContent: Boolean
    $format: String
  ) {
    search(
      after: $after
      first: $first
      query: $query
      includeContent: $includeContent
      format: $format
    ) {
      ... on SearchSuccess {
        edges {
          node {
            createdAt
            title
            url
            description
            labels {
              name
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
          totalCount
        }
      }
      ... on SearchError {
        errorCodes
      }
    }
  }
`;

async function exportArticles() {
  let currentCount = 0;
  let hasNextPage = true;
  const results = [];

  while (hasNextPage) {
    const response = await client.request(getArticles, {
      query: "-label:from_raindrop",
      after: currentCount.toString(),
    });
    const items = response.search.edges.map((e) => ({
      title: e.node.title,
      url: e.node.url,
      note: e.node.description,
      tags: e.node.labels.map((l) => l.name),
      created: e.node.createdAt,
    }));

    results.push(...items);

    currentCount = response.search.pageInfo.endCursor;
    hasNextPage = response.search.pageInfo.hasNextPage;

    console.log(
      `Received...${currentCount} out of ${response.search.pageInfo.totalCount}`,
    );

    if (currentCount > 30) {
      hasNextPage = false;
    }
  }

  console.log("response", results);
}

await exportArticles();
