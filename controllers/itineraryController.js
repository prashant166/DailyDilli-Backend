// controllers/itineraryController.js
const { Op, Sequelize } = require("sequelize");
const { Place, Category } = require("../models");
const { parseItineraryPrompt } = require("../utils/parseItineraryPrompt");
const { getTravelTimesForItinerary } = require("../services/travelService");

const FOOD_REGEX = /\b(hungry|eat|food|breakfast|lunch|dinner|snack|street\s*food|cafe)\b/i;
const hasFoodIntent = (text) => FOOD_REGEX.test(text);

const isStrongCategoryMention = (text, category) =>
  text.toLowerCase().includes(category.toLowerCase());

const fetchFallbackPlaces = async () => {
  const fallbackCategories = ["Cafe", "Historical", "Nightlife"];
  const rows = await Place.findAll({
    where: { status: "approved" },
    include: [{
      model: Category,
      as: "category",
      where: { name: { [Op.in]: fallbackCategories } }
    }],
    order: Sequelize.literal("random()"),
    limit: 9,
  });

  const picked = [];
  const seen = new Set();

  for (const cat of fallbackCategories) {
    const match = rows.find(
      (p) => p.category?.name?.toLowerCase() === cat.toLowerCase() && !seen.has(p.id)
    );
    if (match) {
      picked.push(match);
      seen.add(match.id);
    }
  }

  return picked.slice(0, 3);
};

const createItineraryFromPrompt = async (req, res) => {
  try {
    const { prompt, tags = [] } = req.body;
    const normalisedTags = tags.map((t) => t.toLowerCase());

    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const { duration_in_hours, category, mode_of_travel } =
      await parseItineraryPrompt(prompt);

    const whereBase = { status: "approved" };
    let categoryId = null;
    let finalCategoryName = null;

    // 🍔 Force "Cafe" if food-related intent detected
    if (hasFoodIntent(prompt)) {
      const cafe = await Category.findOne({ where: { name: { [Op.iLike]: "Cafe" } } });
      if (cafe) {
        categoryId = cafe.id;
        finalCategoryName = "Cafe";
        console.log("🍽️ Food intent detected — forcing category Café");
      }
    }

    // 📌 Use AI-extracted category if strongly mentioned
    if (!categoryId && category && isStrongCategoryMention(prompt, category)) {
      const cat = await Category.findOne({ where: { name: { [Op.iLike]: category } } });
      if (cat) {
        categoryId = cat.id;
        finalCategoryName = cat.name;
      }
    }

    const stages = [
      {
        desc: "category + tags",
        build: () => {
          const where = { ...whereBase };
          if (categoryId) where.category_id = categoryId;
          if (normalisedTags.length) where.tags = { [Op.overlap]: normalisedTags };
          return where;
        },
      },
      {
        desc: "tags only",
        build: () =>
          normalisedTags.length
            ? { ...whereBase, tags: { [Op.overlap]: normalisedTags } }
            : null,
      },
    ];

    const needed = Math.max(Math.floor(duration_in_hours / 2.5), 3);
    let places = [];

    for (const stage of stages) {
      if (!stage.build) continue;
      const where = stage.build();
      if (!where) continue;

      places = await Place.findAll({
        where,
        limit: needed,
        order: Sequelize.literal("random()"),
        include: [{ model: Category, as: "category" }],
      });

      if (places.length) {
        console.log(`✅ ${places.length} places via stage: ${stage.desc}`);
        break;
      }
      console.log(`🔍 0 results for stage: ${stage.desc}`);
    }

    if (!places.length) {
      console.log("⚠️ All stages empty, using curated fallback set");
      places = await fetchFallbackPlaces();
    }

    const travelInfo =
      (await getTravelTimesForItinerary(places, mode_of_travel)) || [];

    const totalVisit = places.length * 90; // 90 minutes per place
    const totalTravel = travelInfo.reduce(
      (sum, t) => sum + (t.duration_value || 0) / 60,
      0
    );

    const mins = Math.round(totalVisit + totalTravel);
    const hrs = Math.floor(mins / 60);

    const mapUrl = `https://www.google.com/maps/dir/${places
      .slice(0, 10)
      .map((p) => `${p.latitude},${p.longitude}`)
      .join("/")}`;

    return res.status(200).json({
      prompt,
      duration_in_hours,
      category: finalCategoryName,
      mode_of_travel,
      tags,
      places,
      travelInfo,
      estimated_total_time: `${hrs} hr${hrs !== 1 ? "s" : ""} ${mins % 60} min${
        mins % 60 !== 1 ? "s" : ""
      }`,
      estimated_total_time_minutes: mins,
      full_map_url: mapUrl,
    });
  } catch (err) {
    console.error("❌ Itinerary generation error:", err);
    res.status(500).json({ error: "Server error while generating itinerary" });
  }
};

module.exports = { createItineraryFromPrompt };
