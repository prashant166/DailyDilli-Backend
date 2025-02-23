"use strict";

const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Set up storage destination (only one "uploads" directory)
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration (store files in "uploads" directory)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store directly in "uploads"
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer file filter (accept only images)
const imageFilter = (req, file, cb) => {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (PNG, JPG, JPEG, WEBP) are allowed"), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Compress and resize image before storing (overwrite original)
const handleImageUpload = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next(); // No files uploaded

  try {
    for (let file of req.files) {
      const compressedPath = path.join(uploadDir, file.filename); // Overwrite in same folder

      // Compress & convert image to WebP
      await sharp(file.path)
        .resize(800) // Resize width to 800px
        .webp({ quality: 80 }) // Convert to WebP with 80% quality
        .toFile(compressedPath);

      // Remove the original file after compression
      if (file.path !== compressedPath) {
        fs.unlinkSync(file.path);
      }

      // Update file path reference
      file.compressedPath = compressedPath;
    }

    next();
  } catch (error) {
    console.error("Error compressing images:", error);
    return res.status(500).json({ error: "Image compression failed" });
  }
};


module.exports = { upload, handleImageUpload };
