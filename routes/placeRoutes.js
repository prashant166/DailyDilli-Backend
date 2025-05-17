"use strict";

const express = require("express");
const router = express.Router();
const placeController = require("../controllers/placeController");
const authMiddleware = require("../middlewares/authMiddleware");

// 📌 Create a new place (Only logged-in users)
router.post("/", authMiddleware, placeController.createPlace);

// 📌 Get all approved places
router.get("/", placeController.getPlaces);

// 📌 Get places by category
router.get("/category/:category", placeController.getPlacesByCategory);

// 📌 Update a place (Only the original contributor or an admin)
router.put("/:id", authMiddleware, placeController.updatePlace);

// 📌 Delete a place (Only the original contributor or an admin)
router.delete("/:id", authMiddleware, placeController.deletePlace);

router.get("/:id", placeController.getPlaceById)

module.exports = router;
