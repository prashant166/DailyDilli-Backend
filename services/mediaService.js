"use strict";

const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Set up storage destination for original images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/originals");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer filter to accept only images
const imageFilter = (req, file, cb) => {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (PNG, JPG, JPEG, WEBP) are allowed"), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Compress and resize image before storing
const compressImage = async (filePath, outputDir) => {
  const compressedPath = path.join(outputDir, path.basename(filePath));
  await sharp(filePath)
    .resize(800) // Resize width to 800px (maintain aspect ratio)
    .webp({ quality: 80 }) // Convert to WebP with 80% quality
    .toFile(compressedPath);

  return compressedPath;
};

// Middleware for handling image upload & compression
const handleImageUpload = async (req, res, next) => {
  if (!req.file) return next(); // No file uploaded

  try {
    const compressedDir = path.join(__dirname, "../uploads/compressed");
    if (!fs.existsSync(compressedDir)) {
      fs.mkdirSync(compressedDir, { recursive: true });
    }

    // Compress the image
    const compressedImagePath = await compressImage(req.file.path, compressedDir);

    // Store compressed image info in request for further processing
    req.file.compressedPath = compressedImagePath;

    next();
  } catch (error) {
    console.error("Error compressing image:", error);
    return res.status(500).json({ error: "Image compression failed" });
  }
};

module.exports = { upload, handleImageUpload };
