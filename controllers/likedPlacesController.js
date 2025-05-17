const { LikedPlace, Place, User } = require("../models");

// POST /liked-places
const likePlace = async (req, res) => {
  const { id: user_id } = req.user;
  const { place_id } = req.body;

  try {
    const existing = await LikedPlace.findOne({ where: { user_id, place_id } });
    if (existing) {
      return res.status(400).json({ error: "Place already liked" });
    }

    const liked = await LikedPlace.create({ user_id, place_id });
    return res.status(201).json({ liked });
  } catch (error) {
    console.error("Like error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /liked-places
const getLikedPlaces = async (req, res) => {
  const { id: user_id } = req.user;
  try {
    const likedPlaces = await LikedPlace.findAll({
      where: { user_id },
      include: [{ model: Place, as: "place" }],
    });

    return res.status(200).json({ likedPlaces });
  } catch (error) {
    console.error("Fetch liked places error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE /liked-places/:place_id
const unlikePlace = async (req, res) => {
  const { id: user_id } = req.user;
  const { place_id } = req.params;

  try {
    const deleted = await LikedPlace.destroy({
      where: { user_id, place_id },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Liked place not found" });
    }

    return res.status(200).json({ message: "Place unliked successfully" });
  } catch (error) {
    console.error("Unlike error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { likePlace, getLikedPlaces, unlikePlace };
