const { Place, User, Category } = require("../models");
const opensearchClient = require("../config/opensearchClient");
const axios = require("axios");
const { Op, Sequelize } = require("sequelize");

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Helper to fetch coordinates
const getCoordinates = async (location) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: location,
          key: GOOGLE_API_KEY,
        },
      }
    );

    const result = response.data.results[0];
    if (result) {
      const { lat, lng } = result.geometry.location;
      return { latitude: lat, longitude: lng };
    }
  } catch (err) {
    console.error("Failed to get coordinates:", err.message);
  }

  return { latitude: null, longitude: null };
};

const createPlace = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const {
      name,
      category_id,
      description,
      location,
      latitude,
      longitude,
      tags,
      budget_per_head,
      entry_fee,
      best_time_to_visit,
      parking_available,
    } = req.body;

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    // If lat/lng not provided, fetch from Google Maps
    let finalLat = latitude;
    let finalLng = longitude;

    if (!latitude || !longitude) {
      const coords = await getCoordinates(location);
      finalLat = coords.latitude;
      finalLng = coords.longitude;
    }

    const place = await Place.create({
      user_id,
      name,
      category_id,
      description,
      location,
      latitude: finalLat,
      longitude: finalLng,
      tags,
      budget_per_head,
      entry_fee,
      best_time_to_visit,
      parking_available,
      status: "approved",
    });

    // Index in OpenSearch
    await opensearchClient.index({
      index: "places_index",
      id: place.id.toString(),
      body: {
        name,
        description,
        category_id,
        location,
        latitude: finalLat,
        longitude: finalLng,
        tags,
        budget_per_head,
        entry_fee,
        best_time_to_visit,
        parking_available,
      },
    });

    return res.status(201).json({ message: "Place added successfully", place });
  } catch (error) {
    console.error("Error adding place:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// 📌 Get all approved places
const getPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      where: { status: "approved" },
      include: [
        { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],

    });

    return res.status(200).json({ places });
  } catch (error) {
    console.error("Error fetching places:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Get places by category
const getPlacesByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const places = await Place.findAll({
      where: { category_id, status: "approved" },
      include: [
        { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    return res.status(200).json({ places });
  } catch (error) {
    console.error("Error fetching places by category_id:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Update a place (only contributor or admin)
// const updatePlace = async (req, res) => {
//   try {
//     const { id: user_id, role } = req.user; // Get logged-in user ID & role
//     const { id } = req.params;
//     const { category_id } = req.body;
//     const place = await Place.findByPk(id);

//     if (!place) {
//       return res.status(404).json({ error: "Place not found" });
//     }

//     // Allow only admin or the original contributor to edit
//     if (place.user_id !== user_id && role !== "admin") {
//       return res.status(403).json({ error: "Unauthorized to update this place" });
//     }

//     // Validate category ID if provided
//     if (category_id) {
//       const category = await Category.findByPk(category_id);
//       if (!category) {
//         return res.status(400).json({ error: "Invalid category ID" });
//       }
//     }

//     await place.update(req.body);

//     await opensearchClient.update({
//       index: "places_index",
//       id: id.toString(),
//       body: {
//         doc: req.body,
//       },
//     });


//     return res.status(200).json({ message: "Place updated successfully", place });
//   } catch (error) {
//     console.error("Error updating place:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id } = req.body;
    const place = await Place.findByPk(id);

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    // Validate category ID if provided
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
    }

    await place.update(req.body);

    try {
      await opensearchClient.update({
        index: "places_index",
        id: id.toString(),
        body: {
          doc: req.body,
        },
      });
    } catch (err) {
      if (err.meta && err.meta.statusCode === 404) {
        console.warn(`OpenSearch document not found for update: ${id}`);
        // Optional: create the document instead if it doesn't exist
        // await opensearchClient.index({
        //   index: "places_index",
        //   id: id.toString(),
        //   body: req.body,
        // });
      } else {
        throw err; // Let other errors bubble up
      }
    }

    return res.status(200).json({ message: "Place updated successfully", place });
  } catch (error) {
    console.error("Error updating place:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// 📌 Delete a place (only contributor or admin)
const deletePlace = async (req, res) => {
  try {
    const { id: user_id, role } = req.user;
    const { id } = req.params;

    const place = await Place.findByPk(id);
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    // Optional access control:
    // if (place.user_id !== user_id && role !== "admin") {
    //   return res.status(403).json({ error: "Unauthorized to delete this place" });
    // }

    await place.destroy();

    // 🧹 Try to remove from OpenSearch index too
    try {
      await opensearchClient.delete({
        index: 'places_index',
        id: id.toString(),
      });
    } catch (err) {
      if (err.meta?.statusCode === 404) {
        console.warn(`Place ${id} not found in OpenSearch, continuing...`);
      } else {
        console.error("Error deleting from OpenSearch:", err);
        return res.status(500).json({ error: "Failed to delete from OpenSearch" });
      }
    }

    return res.status(200).json({ message: "Place deleted successfully" });
  } catch (error) {
    console.error("Error deleting place:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};




const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await Place.findOne({
      where: { id, status: "approved" },
      include: [
        { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    const lat = parseFloat(place.latitude);
    const lng = parseFloat(place.longitude);

    const cafeCategory = await Category.findOne({
      where: { name: { [Op.iLike]: "Cafe" } },
    });

    const haversineOrder = Sequelize.literal(`
      6371 * acos(
        cos(radians(${lat}))
        * cos(radians(latitude))
        * cos(radians(longitude) - radians(${lng}))
        + sin(radians(${lat}))
        * sin(radians(latitude))
      )
    `);

    const nearbyCafes = await Place.findAll({
      where: {
        status: "approved",
        category_id: cafeCategory?.id || null,
        id: { [Op.ne]: place.id },
      },
      order: haversineOrder,
      limit: 3,
      include: [{ model: Category, as: "category" }],
    });

    const otherNearby = await Place.findAll({
      where: {
        status: "approved",
        id: { [Op.ne]: place.id },
        category_id: { [Op.ne]: cafeCategory?.id || null },
      },
      order: haversineOrder,
      limit: 3,
      include: [{ model: Category, as: "category" }],
    });

    const google_map_url = lat && lng
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : null;

    return res.status(200).json({
      place,
      google_map_url,
      nearbyCafes,
      otherNearby,
    });
  } catch (error) {
    console.error("Error fetching place by id:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// In-memory cache
let cachedSuggestions = [];
let lastCacheTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const getSuggestedPlaces = async (req, res) => {
  try {
    const now = Date.now();

    // Check if cache is still valid
    if (cachedSuggestions.length && lastCacheTime && now - lastCacheTime < CACHE_DURATION) {
      return res.status(200).json({ suggested: cachedSuggestions });
    }

    // Rebuild cache
    const allPlaces = await Place.findAll({
      where: { status: "approved" },
      include: [
        { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    // Shuffle the array and pick 8
    const shuffled = allPlaces.sort(() => 0.5 - Math.random());
    cachedSuggestions = shuffled.slice(0, 8);
    lastCacheTime = now;

    return res.status(200).json({ suggested: cachedSuggestions });
  } catch (error) {
    console.error("Error fetching suggested places:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
  createPlace,
  getPlaces,
  getPlacesByCategory,
  updatePlace,
  deletePlace,
  getPlaceById,
  getSuggestedPlaces
};
