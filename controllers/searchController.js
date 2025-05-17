"use strict";
const { Place, User, Category } = require("../models");
const opensearchClient = require("../config/opensearchClient");
const { expandQueryWithAI } = require("../utils/aiHelper");

// 📌 Index all approved places into OpenSearch
const indexPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      where: { status: "approved" },
      include: [
        { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    const bulkBody = [];

    places.forEach((place) => {
      bulkBody.push({ index: { _index: "places_index", _id: place.id } });
      bulkBody.push({
        id: place.id,
        name: place.name,
        category: place.category ? place.category.name : null,
        description: place.description,
        location: place.location,
        latitude: place.latitude,
        longitude: place.longitude,
        tags: place.tags,
        budget_per_head: place.budget_per_head,
        entry_fee: place.entry_fee,
        best_time_to_visit: place.best_time_to_visit,
        parking_available: place.parking_available,
        images: place.images,
        user: place.user ? `${place.user.first_name} ${place.user.last_name}` : null,
      });
    });

    await opensearchClient.bulk({ body: bulkBody });

    return res.status(200).json({ message: "Places indexed successfully!" });
  } catch (error) {
    console.error("Error indexing places:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Search for places in OpenSearch
const searchPlaces = async (req, res) => {
  try {
    const { query, category, budget_per_head, tags, parking_available, best_time_to_visit } = req.query;

    const mustQueries = [];

    let searchKeywords = [];

    if (query) {
      // 🌟 Expand search using Gemini AI
      searchKeywords = await expandQueryWithAI(query);

      console.log("Expanded keywords:", searchKeywords);

      const contradictoryPairs = [
        ["luxury", "budget-friendly"],
        ["peaceful", "crowded"], 
      ];
      
      for (const [a, b] of contradictoryPairs) {
        if (searchKeywords.includes(a) && searchKeywords.includes(b)) {
          searchKeywords = searchKeywords.filter(tag => tag !== a); 
        }
      }
      

      if (searchKeywords.includes("luxury") && searchKeywords.includes("budget-friendly")) {
        searchKeywords = searchKeywords.filter(tag => tag !== "luxury");
      }
      

      mustQueries.push({
        multi_match: {
          query: query,
          fields: ["name", "description", "tags"],
          fuzziness: "AUTO",
        },
      });


      // Boost results based on expanded keywords
      if (searchKeywords.length) {
        mustQueries.push({
          terms: {
            tags: searchKeywords,
          },
        });
      }
    }




    // Optional filters
    if (category) {
      mustQueries.push({ match: { category } });
    }

    if (budget_per_head) {
      mustQueries.push({ match: { budget_per_head } });
    }

    if (best_time_to_visit) {
      mustQueries.push({ match: { best_time_to_visit } });
    }

    if (parking_available !== undefined) {
      mustQueries.push({ match: { parking_available: parking_available === "true" } });
    }

    if (tags) {
      const tagArray = tags.split(",");
      mustQueries.push({
        terms: { tags: tagArray },
      });
    }

    const searchQuery = {
      index: "places_index",
      body: {
        query: {
          bool: {
            must: mustQueries,
            should: [
              {
                match: {
                  category: {
                    query: "Adventure",
                    boost: 2,
                  },
                },
              },
              {
                terms: {
                  tags: searchKeywords,
                },
              },
            ],
            
            minimum_should_match: 1, 
          },
        },
      },
    };
    

    const response = await opensearchClient.search(searchQuery);

    const places = response.body.hits.hits.map((hit) => hit._source);
    return res.status(200).json({ places });
  } catch (error) {
    console.error("Error searching places:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};


module.exports = { indexPlaces, searchPlaces };
