const opensearchClient = require("../config/opensearchClient");

const indexName = "places"; // Your index name

// Function to create index (only run once)
const createIndex = async () => {
  try {
    const exists = await opensearchClient.indices.exists({ index: indexName });

    if (!exists.body) {
      const response = await opensearchClient.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              name: { type: "text" },
              description: { type: "text" },
              location: { type: "text" },
              latitude: { type: "float" },
              longitude: { type: "float" },
              category_id: { type: "integer" },
              tags: { type: "text" },
            },
          },
        },
      });
      console.log("✅ Index created:", response);
    } else {
      console.log("✅ Index already exists");
    }
  } catch (error) {
    console.error("❌ Error creating index:", error);
  }
};

module.exports = { createIndex };
