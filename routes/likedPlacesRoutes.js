"use strict";
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const likedPlaceController = require("../controllers/likedPlacesController");

// POST: Like a place
router.post("/", authMiddleware, likedPlaceController.likePlace);

// GET: Get liked places for logged-in user
router.get("/", authMiddleware, likedPlaceController.getLikedPlaces);

// DELETE: Unlike a place
router.delete("/:place_id", authMiddleware, likedPlaceController.unlikePlace);

module.exports = router;
