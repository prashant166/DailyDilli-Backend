const { Place } = require("../models");
const opensearchClient = require("../config/opensearchClient");

const syncPlacesToOpenSearch = async () => {
  try {
    const places = await Place.findAll();

    if (!places.length) {
      console.log("⚠️ No places found to sync.");
      return;
    }

    const body = places.flatMap((place) => [
      { index: { _index: "places_index", _id: place.id } }, // Metadata
      {
        name: place.name,
        description: place.description,
        category_id: place.category_id,
        location: place.location,
        latitude: place.latitude,
        longitude: place.longitude,
        tags: place.tags,
        budget_per_head: place.budget_per_head,
        entry_fee: place.entry_fee,
        best_time_to_visit: place.best_time_to_visit,
        parking_available: place.parking_available,
      },
    ]);

    const { body: response } = await opensearchClient.bulk({ refresh: true, body });

    console.log("✅ Places synced to OpenSearch:", response);
  } catch (error) {
    console.error("❌ Error syncing places:", error);
  }
};

syncPlacesToOpenSearch();
