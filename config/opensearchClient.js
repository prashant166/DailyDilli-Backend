const { Client } = require("@opensearch-project/opensearch");
require("dotenv").config();

const isLocal = process.env.NODE_ENV !== "production"; // Check if running locally

const opensearchClient = new Client({
  node: isLocal ? "http://localhost:9200" : process.env.OPENSEARCH_URL, // Use local ES in dev mode
  ...(isLocal
    ? {} // No auth for local
    : {
        auth: {
          username: process.env.OS_USERNAME || "", // For AWS OpenSearch
          password: process.env.OS_PASSWORD || "",
        },
        ssl: {
          rejectUnauthorized: false, // Avoid SSL issues
        },
      }),
});

console.log("Connected to OpenSearch:", isLocal ? "Local" : "AWS");

module.exports = opensearchClient;
