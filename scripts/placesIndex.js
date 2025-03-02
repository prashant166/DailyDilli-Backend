const opensearchClient = require("../config/opensearchClient");

const createPlacesIndex = async () => {
  try {
    const indexName = "places_index";

    const exists = await opensearchClient.indices.exists({ index: indexName });

    if (!exists.body) {
      const response = await opensearchClient.indices.create({
        index: indexName,
        body: {
          settings: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  type: "custom",
                  tokenizer: "standard",
                  filter: ["lowercase", "asciifolding"],
                },
              },
            },
          },
          mappings: {
            properties: {
              name: { type: "text", analyzer: "autocomplete_analyzer" },
              description: { type: "text" },
              category_id: { type: "integer" },
              location: { type: "text" },
              latitude: { type: "double" },
              longitude: { type: "double" },
              tags: { type: "keyword" },
              budget_per_head: { type: "keyword" },
              entry_fee: { type: "double" },
              best_time_to_visit: { type: "keyword" },
              parking_available: { type: "boolean" },
            },
          },
        },
      });
      console.log("✅ Created OpenSearch Index:", response.body);
    } else {
      console.log("ℹ️ Index already exists.");
    }
  } catch (error) {
    console.error("❌ Error creating index:", error);
  }
};

createPlacesIndex();
