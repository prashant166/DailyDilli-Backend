"use strict";

const express = require("express");
const router = express.Router();
const placeController = require("../controllers/placeController");
// const authMiddleware = require("../middleware/authMiddleware"); // Ensure this middleware checks for authentication

// 📌 Create a new place (Only logged-in users)
router.post("/places", /*authMiddleware, */ placeController.createPlace);

// 📌 Get all approved places
router.get("/places", placeController.getPlaces);

// 📌 Get places by category
router.get("/places/category/:category", placeController.getPlacesByCategory);

// 📌 Update a place (Only the original contributor or an admin)
router.put("/places/:id",  /*authMiddleware, */ placeController.updatePlace);

// 📌 Delete a place (Only the original contributor or an admin)
router.delete("/places/:id",  /*authMiddleware, */ placeController.deletePlace);

module.exports = router;
