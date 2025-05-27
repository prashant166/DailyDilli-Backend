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
    const {
      query,
      category,
      budget_per_head,
      tags,
      parking_available,
      best_time_to_visit,
    } = req.query;

    const mustFilters = [];
    if (category) mustFilters.push({ match: { category } });
    if (budget_per_head) mustFilters.push({ match: { budget_per_head } });
    if (best_time_to_visit) mustFilters.push({ match: { best_time_to_visit } });

    if (parking_available !== undefined) {
      mustFilters.push({
        match: { parking_available: parking_available === "true" },
      });
    }

    if (tags) {
      mustFilters.push({ terms: { tags: tags.split(",") } });
    }

    const shouldQueries = [];
    let searchKeywords = [];

    if (query) {
      shouldQueries.push({
        match_phrase: {
          name: {
            query,
            boost: 8,
          },
        },
      });

      shouldQueries.push({
        multi_match: {
          query,
          fields: ["name^3", "description", "tags"],
          fuzziness: "AUTO",
          boost: 2,
        },
      });

      searchKeywords = await expandQueryWithAI(query);

      const contradictoryPairs = [
        ["luxury", "budget-friendly"],
        ["peaceful", "crowded"],
      ];
      for (const [a, b] of contradictoryPairs) {
        if (searchKeywords.includes(a) && searchKeywords.includes(b)) {
          searchKeywords = searchKeywords.filter((t) => t !== a);
        }
      }

      if (searchKeywords.length) {
        shouldQueries.push({
          terms: { tags: searchKeywords },
        });
      }
    }

    const searchQuery = {
      index: "places_index",
      size: 10,
      body: {
        query: {
          bool: {
            must: mustFilters,
            should: shouldQueries,
            minimum_should_match: shouldQueries.length ? 1 : 0,
          },
        },
        sort: [{ _score: { order: "desc" } }],
      },
    };

    // ❶ — build the ES query (unchanged)
const esResp = await opensearchClient.search(searchQuery);

// ❷ — robust ID extraction
const matchedIds = esResp.body.hits.hits
  .map(h => h._source?.id ?? Number(h._id))   // use _source.id or _id
  .filter(Boolean);                           // remove undefined / NaN

let places;

// ❸ — fallback runs correctly now
if (matchedIds.length === 0) {
  places = await Place.findAll({
    where: { status: "approved" },
    limit: 10,
    order: [["createdAt", "DESC"]],
    include: [
      { model: User,     as: "user",     attributes: ["id","first_name","last_name","email"] },
      { model: Category, as: "category", attributes: ["id","name"] },
    ],
  });
} else {
  const dbRows = await Place.findAll({
    where: { id: matchedIds, status: "approved" },
    include: [
      { model: User,     as: "user",     attributes: ["id","first_name","last_name","email"] },
      { model: Category, as: "category", attributes: ["id","name"] },
    ],
  });

  const rowMap = Object.fromEntries(dbRows.map(p => [p.id, p]));
  places = matchedIds.map(id => rowMap[id]).filter(Boolean);
}


    return res.status(200).json({ places });
  } catch (error) {
    console.error("Error searching places:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};



module.exports = { indexPlaces, searchPlaces };
