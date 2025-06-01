const { Client } = require("@elastic/elasticsearch");
require("dotenv").config();

const isLocal = process.env.NODE_ENV !== "production";

const elasticClient = new Client({
  node: isLocal ? "http://localhost:9200" : process.env.OPENSEARCH_URL,
  compatibilityMode: true, // ✅ This enables "compatible-with=8"
  ...(isLocal
    ? {}
    : {
        auth: {
          username: process.env.OS_USERNAME || "",
          password: process.env.OS_PASSWORD || "",
        },
        ssl: {
          rejectUnauthorized: false,
        },
      }),
  // ❌ REMOVE custom headers if you had them
});

module.exports = elasticClient;
