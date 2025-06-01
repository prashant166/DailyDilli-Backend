const axios = require("axios");
require("dotenv").config();

const ORS_API_KEY = process.env.ORS_API_KEY;
if (!ORS_API_KEY) {
  throw new Error("🚨 ORS_API_KEY is missing. Check your .env file.");
}

/* ------------ helpers ------------------ */
const parseDuration = (seconds) => Number(seconds) || 0;

const mapToORSProfile = (raw = "") => {
  const m = raw.toLowerCase();
  if (["walk", "walking"].includes(m)) return "foot-walking";
  if (["bicycle", "cycle", "pedal"].includes(m)) return "cycling-regular";
  if (["two_wheeler", "scooter", "motorbike", "bike_motor"].includes(m)) return "driving-car";
  return "driving-car"; // default
};

/* ------------ single-leg call ------------------ */
const getTravelTimeBetweenCoords = async (
  origin,
  destination,
  mode = "DRIVE"
) => {
  try {
    const profile = mapToORSProfile(mode);

    const url = `https://api.openrouteservice.org/v2/directions/${profile}`;

    const { data } = await axios.get(url, {
      params: {
        start: `${origin.lng},${origin.lat}`,
        end: `${destination.lng},${destination.lat}`,
      },
      headers: {
        Authorization: ORS_API_KEY,
      },
    });

    const summary = data?.features?.[0]?.properties?.summary;
    if (!summary) throw new Error("Invalid ORS response");

    const durSec = parseDuration(summary.duration);
    return {
      distance: `${(summary.distance / 1000).toFixed(1)} km`,
      duration: `${Math.round(durSec / 60)} mins`,
      duration_value: durSec,
    };
  } catch (err) {
    console.error(
      "❌ ORS error:",
      err.response?.data || err.message || err
    );
  }
  return { distance: null, duration: null, duration_value: null };
};

/* ------------ multi-leg helper ------------------ */
const getTravelTimesForItinerary = async (places, mode = "DRIVE") => {
  const travelMode = mode; // keep raw for logging or external use
  const travelTimes = [];

  for (let i = 0; i < places.length - 1; i++) {
    const origin = { lat: places[i].latitude, lng: places[i].longitude };
    const dest = { lat: places[i + 1].latitude, lng: places[i + 1].longitude };

    const info = await getTravelTimeBetweenCoords(origin, dest, travelMode);

    travelTimes.push({
      from: places[i].id,
      to: places[i + 1].id,
      distance: info.distance,
      duration: info.duration,
      duration_value: info.duration_value,
      map_url: `https://maps.openrouteservice.org/directions?n1=${origin.lat}&n2=${origin.lng}&n3=14&a=${origin.lat},${origin.lng},${dest.lat},${dest.lng}&b=0&c=0&k1=en-US&k2=km`, // ORS map link
    });
  }

  return travelTimes;
};

module.exports = { getTravelTimeBetweenCoords, getTravelTimesForItinerary };
