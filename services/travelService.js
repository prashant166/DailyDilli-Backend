const axios = require("axios");

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const getTravelTimeBetweenCoords = async (origin, destination, mode = "driving") => {
  try {
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;

    const response = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
      params: {
        origins: originStr,
        destinations: destinationStr,
        mode,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    const data = response.data;
    console.log("📡 Distance Matrix API raw response:", JSON.stringify(data, null, 2));

    const element = data.rows?.[0]?.elements?.[0];

    if (element?.status === "OK") {
      return {
        distance: element.distance.text,
        duration: element.duration.text,
        duration_value: element.duration.value, // in seconds
      };
    }

    console.warn("⚠️ No valid travel data returned:", element?.status);
    return { distance: null, duration: null, duration_value: null };
  } catch (error) {
    console.error("❌ Error fetching travel time:", error.message);
    return { distance: null, duration: null, duration_value: null };
  }
};


const getTravelTimesForItinerary = async (places, mode = "driving") => {
  const travelTimes = [];

  for (let i = 0; i < places.length - 1; i++) {
    const origin = { lat: places[i].latitude, lng: places[i].longitude };
    const destination = { lat: places[i + 1].latitude, lng: places[i + 1].longitude };

    const travelInfo = await getTravelTimeBetweenCoords(origin, destination, mode);

    travelTimes.push({
      from: places[i].id,
      to: places[i + 1].id,
      distance: travelInfo.distance,
      duration: travelInfo.duration,
      duration_value: travelInfo.duration_value,
      map_url: `https://www.google.com/maps/dir/${origin.lat},${origin.lng}/${destination.lat},${destination.lng}/`,
    });
  }

  return travelTimes;
};


module.exports = { getTravelTimeBetweenCoords, getTravelTimesForItinerary };
