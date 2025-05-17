"use strict";
const { Category } = require("../models");

// 📌 Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [["id", "ASC"]] });
    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Add a new category
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });

    const existing = await Category.findOne({ where: { name } });
    if (existing) return res.status(409).json({ error: "Category already exists" });

    const category = await Category.create({ name });
    return res.status(201).json({ message: "Category created", category });
  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Update a category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    category.name = name;
    await category.save();

    return res.status(200).json({ message: "Category updated", category });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Delete a category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    await category.destroy();
    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};
