const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// GET all categories
router.get("/", getAllCategories);

// POST a new category
router.post("/", addCategory);

// PUT (update) a category
router.put("/:id", updateCategory);

// DELETE a category
router.delete("/:id", deleteCategory);

module.exports = router;
