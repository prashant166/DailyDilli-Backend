const express = require("express");
const router = express.Router();
const placeMediaController = require("../controllers/placeMediaController");
const { upload, handleImageUpload } = require("../services/mediaService");
const authMiddleware = require("../middlewares/authMiddleware");

// 📌 Upload multiple images for a place
router.post(
  "/:id/images",
  authMiddleware,
  upload.array("images", 5), // Allow up to 5 images
  handleImageUpload,
  placeMediaController.uploadPlaceImages
);

// 📌 Delete an image from a place by index
router.delete("/media/:placeId/images/:imageIndex", authMiddleware, placeMediaController.deletePlaceImage);

module.exports = router;
