const express = require("express");
const { indexPlaces, searchPlaces } = require("../controllers/searchController");

const router = express.Router();

// Route to index all places into OpenSearch
router.post("/index", indexPlaces);

// Route to search places in OpenSearch
router.get("/", searchPlaces);

module.exports = router;
