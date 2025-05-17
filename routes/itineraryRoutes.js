const express = require("express");
const router = express.Router();
const { createItineraryFromPrompt } = require("../controllers/itineraryController");

router.post("/", createItineraryFromPrompt);

module.exports = router;
