"use strict";

const path = require("path");
const fs = require("fs");
const { Place } = require("../models");
const { upload, handleImageUpload } = require("../services/mediaService"); // Uses multer & sharp
const { Op } = require("sequelize");
const { v2: cloudinary } = require("cloudinary");


// 📌 Upload Images for a Place
const uploadPlaceImages = async (req, res) => {
  const placeId = req.params.id;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Get uploaded file paths
    const imagePaths = req.files.map((file) => file.path); 

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
const extractPublicIdFromUrl = (url) => {
  try {
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/uploads/abc123.jpg
    const parts = url.split("/");
    const fileWithExt = parts.pop(); // abc123.jpg
    const publicId = fileWithExt.split(".")[0]; // abc123

    // Optional: get folder path if needed
    const folder = parts.slice(parts.indexOf("upload") + 1).join("/"); // uploads
    return `${folder}/${publicId}`; // returns: uploads/abc123
  } catch {
    return null;
  }
};

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

    const imageUrl = place.images[imageIndex];

    // 🔍 Extract Cloudinary public_id from URL
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return res.status(400).json({ error: "Could not extract public_id from image URL" });
    }

    // 🚫 Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // 🧹 Remove from DB array
    const updatedImages = place.images.filter((_, idx) => idx !== Number(imageIndex));
    await place.update({ images: updatedImages });

    res.status(200).json({
      message: "Image deleted successfully",
      images: updatedImages,
    });
  } catch (error) {
    console.error("Error deleting place image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { uploadPlaceImages, deletePlaceImage };
