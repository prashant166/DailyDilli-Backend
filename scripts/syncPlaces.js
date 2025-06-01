const { Place } = require("../models");
const opensearchClient = require("../config/opensearchClient");

const syncPlacesToOpenSearch = async () => {
  try {
    const places = await Place.findAll({ where: { status: "approved" } });

    if (!places.length) {
      console.log("⚠️ No approved places found to sync.");
      return;
    }

    const body = places.flatMap((place) => {
  const tags = Array.isArray(place.tags)
  ? place.tags.flatMap(tag => tag.toLowerCase().split(/[\s\-]+/))
  : (place.tags || "")
      .split(",")
      .flatMap(t => t.trim().toLowerCase().split(/[\s\-]+/));


  return [
    { index: { _index: "places_index_v2", _id: place.id.toString() } },
    {
      name: place.name,
      description: place.description,
      category_id: place.category_id,
      location: place.location,
      latitude: place.latitude,
      longitude: place.longitude,
      tags, // normalized array
      budget_per_head: place.budget_per_head,
      entry_fee: place.entry_fee,
      best_time_to_visit: place.best_time_to_visit,
      parking_available: place.parking_available,
    },
  ];
});

    const response = await opensearchClient.bulk({ refresh: true, body });

    console.log(`✅ Synced ${places.length} places to OpenSearch.`);
    if (response.errors) {
      const errored = response.items.filter(i => i.index && i.index.error);
      console.warn(`⚠️ ${errored.length} documents had errors during sync.`);
    }
  } catch (error) {
    console.error("❌ Error syncing places:", error);
  }
};

syncPlacesToOpenSearch();
