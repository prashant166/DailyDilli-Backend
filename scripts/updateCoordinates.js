require("dotenv").config();
const axios = require("axios");
const { sequelize, Place } = require("../models");


const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const getCoordinates = async (location) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        address: location,
        key: GOOGLE_API_KEY,
      },
    });

    const result = response.data.results[0];
    if (result) {
      const { lat, lng } = result.geometry.location;
      return { latitude: lat, longitude: lng };
    }

    return null;
  } catch (err) {
    console.error("Error fetching coordinates:", err.message);
    return null;
  }
};

const updateMissingCoordinates = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database");

    const places = await Place.findAll({
      where: {
        latitude: null,
        longitude: null,
      },
    });

    console.log(`🔍 Found ${places.length} places with missing coordinates`);

    for (const place of places) {
      const coords = await getCoordinates(place.location);
      if (coords) {
        await place.update(coords);
        console.log(`📍 Updated ${place.name} with lat/lng`);
      } else {
        console.warn(`⚠️ Could not find coordinates for ${place.name}`);
      }
    }

    console.log("✅ All done.");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

updateMissingCoordinates();
