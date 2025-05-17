const { Place, Category } = require("../models");
const { parseItineraryPrompt } = require("../utils/parseItineraryPrompt");
const { getTravelTimesForItinerary } = require("../services/travelService");
const { Op } = require("sequelize");

const createItineraryFromPrompt = async (req, res) => {
  try {
    const { prompt, tags } = req.body;
    if (!prompt) {
      console.warn("⚠️  No prompt received in request body");
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("🧠 Received prompt:", prompt);
    if (tags?.length) console.log("🏷️  User-supplied tags:", tags);

    // 1. Parse AI prompt
    const {
      duration_in_hours,
      category,
      budget,
      mode_of_travel,
    } = await parseItineraryPrompt(prompt);

    console.log("📦 Parsed AI data:", {
      duration_in_hours,
      category,
      budget,
      mode_of_travel,
    });

    // 2. Convert category name to ID
    let categoryId = null;
    if (category) {
      const matchedCategory = await Category.findOne({
        where: {
          name: { [Op.iLike]: category },
        },
      });

      if (matchedCategory) {
        categoryId = matchedCategory.id;
        console.log("✅ Matched category ID:", categoryId);
      } else {
        console.warn("⚠️  No category matched for name:", category);
      }
    }

    // 3. Estimate how many places to show
    const estimatedPlaceCount = Math.max(Math.floor(duration_in_hours / 2.5), 1);
    console.log("🔢 Estimated number of places to show:", estimatedPlaceCount);

    // 4. Build dynamic query
    const budgetEnum = budget.charAt(0).toUpperCase() + budget.slice(1);
    const whereClause = {
      budget_per_head: budgetEnum,
      status: "approved",
    };

    if (categoryId) whereClause.category_id = categoryId;
    if (tags?.length) whereClause.tags = { [Op.overlap]: tags };

    const places = await Place.findAll({
      where: whereClause,
      limit: estimatedPlaceCount,
    });

    console.log("📍 Fetched matching places:", places.length);

    if (!places.length) {
      return res.status(404).json({ message: "No places found for this itinerary" });
    }

    // 5. Compute travel time
    const travelInfo = await getTravelTimesForItinerary(places, mode_of_travel);
    console.log("🛣️  Travel times between places computed");

    const totalVisitMinutes = places.length * 90;
    const totalTravelMinutes = travelInfo.reduce(
      (sum, leg) => sum + (leg.duration_value ? leg.duration_value / 60 : 0),
      0
    );

    const estimatedTotalMinutes = Math.round(totalVisitMinutes + totalTravelMinutes);
    const hours = Math.floor(estimatedTotalMinutes / 60);
    const minutes = estimatedTotalMinutes % 60;
    const estimated_total_time = `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`;

    // 6. Generate Google Maps URL
    const trimmedPlaces = places.slice(0, 10);
    const allCoords = trimmedPlaces.map(p => `${p.latitude},${p.longitude}`).join("/");
    const fullMapUrl = `https://www.google.com/maps/dir/${allCoords}`;
    console.log("🗺️  Generated Google Maps route URL");

    return res.status(200).json({
      prompt,
      duration_in_hours,
      category,
      budget,
      mode_of_travel,
      tags: tags || [],
      places,
      travelInfo,
      estimated_total_time,
      estimated_total_time_minutes: estimatedTotalMinutes,
      full_map_url: fullMapUrl,
    });
  } catch (error) {
    console.error("❌ Itinerary generation error:", error.message);
    return res.status(500).json({ error: "Server error while generating itinerary" });
  }
};

module.exports = { createItineraryFromPrompt };
