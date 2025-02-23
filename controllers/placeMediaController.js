"use strict";

const path = require("path");
const fs = require("fs");
const { Place } = require("../models");
const { upload, handleImageUpload } = require("../services/mediaService"); // Uses multer & sharp
const { Op } = require("sequelize");

// 📌 Upload Images for a Place
const uploadPlaceImages = async (req, res) => {
  const placeId = req.params.id;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Get uploaded file paths
    const imagePaths = req.files.map((file) => file.compressedPath);

    // Update images field in the Place table
    const place = await Place.findByPk(placeId);
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    // Append new images to the existing array
    const updatedImages = place.images ? [...place.images, ...imagePaths] : imagePaths;
    await place.update({ images: updatedImages });

    res.status(200).json({
      message: "Images uploaded successfully",
      images: updatedImages,
    });
  } catch (error) {
    console.error("Error uploading place images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Delete an Image from a Place
const deletePlaceImage = async (req, res) => {
  const { placeId, imageIndex } = req.params;

  try {
    const place = await Place.findByPk(placeId);

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    if (!place.images || place.images.length <= imageIndex) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    // Get the image path and remove it from storage
    const imagePath = place.images[imageIndex];
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove the image from the database
    const updatedImages = place.images.filter((_, idx) => idx !== Number(imageIndex));
    await place.update({ images: updatedImages });

    res.status(200).json({ message: "Image deleted successfully", images: updatedImages });
  } catch (error) {
    console.error("Error deleting place image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { uploadPlaceImages, deletePlaceImage };
