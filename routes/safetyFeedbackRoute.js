"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const safetyController = require("../controllers/safetyFeedbackController");

// 📌 Submit safety feedback (logged-in users only)
router.post("/", authMiddleware, safetyController.submitSafetyFeedback);

// 📌 Get female-only safety stats for a place
router.get("/:placeId", safetyController.getSafetyStats);

module.exports = router;
