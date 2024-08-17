import { gql, GraphQLClient } from "graphql-request";
import { json2csv } from "json-2-csv";

function getArgs(argv) {
  const result = {};

  argv.splice(0, 2);
  argv.forEach((arg, index) => {
    if (arg.substring(0, 2) === "--") {
      const key = arg.substring(2, arg.length);
      const value =
        argv[index + 1].substring(0, 2) === "--" ? true : argv[index + 1];
      result[key] = value === "false" ? false : value;
    }
  });

  return result;
}

const {
  "search-query": searchQuery = "",
  "full-data": fullData = true,
  "add-tag": addTag = "",
} = getArgs(Bun.argv);

// TODO:
// add the search query as an option --search-query
// add the description (and other fields) as an option --full-data
// add a import tag as an option --add-tag

console.log("yo ", searchQuery, fullData, addTag);

const key = Bun.env.API_KEY;
const client = new GraphQLClient("https://api-prod.omnivore.app/api/graphql", {
  headers: {
    authorization: key,
  },
});

const getArticles = gql`
  query Search($after: String, $first: Int, $query: String) {
    search(after: $after, first: $first, query: $query) {
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
      query: searchQuery,
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
      `Received...${currentCount} out of ${response.search.pageInfo.totalCount} articles`,
    );

    // TODO: remove this to do it for every item
    if (currentCount > 30) {
      hasNextPage = false;
    }
  }

  Bun.write("exported_articles.json", JSON.stringify(results));
  return results;
}

function preProcessArticles(articles) {
  const result = articles.map((a) => ({
    ...a,
    title: a.title.replace(/\n|\r/g, ""),
    tags: [...a.tags, addTag].join(", "),
    note: a.note ? a.note.replace(/\n|\r/g, "") : "",
  }));

  Bun.write("processed_articles.json", JSON.stringify(result));
  return result;
}

function convertToCSV(articles) {
  const csv = json2csv(articles, {
    delimiter: {
      field: ",",
      wrap: '"',
      eol: "\n",
    },
  });

  Bun.write("processed_articles.csv", csv);
  return csv;
}

const exportedArticles = await exportArticles();
const processedArticles = preProcessArticles(exportedArticles);
convertToCSV(processedArticles);
