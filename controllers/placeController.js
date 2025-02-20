"use strict";
const { Place, User } = require("../models");

// 📌 Create a new place
const createPlace = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Get user ID from auth middleware
    const {
      name,
      category,
      description,
      location,
      latitude,
      longitude,
      tags,
      budget_per_head,
      entry_fee,
      best_time_to_visit,
      parking_available,
      images,
    } = req.body;

    // Create the place with default 'approved' status
    const place = await Place.create({
      user_id,
      name,
      category,
      description,
      location,
      latitude,
      longitude,
      tags,
      budget_per_head,
      entry_fee,
      best_time_to_visit,
      parking_available,
      images,
      status: "approved", // Default status for now
    });

    return res.status(201).json({ message: "Place added successfully", place });
  } catch (error) {
    console.error("Error adding place:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Get all approved places
const getPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      where: { status: "approved" },
      include: { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
    });

    return res.status(200).json({ places });
  } catch (error) {
    console.error("Error fetching places:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Get places by category
const getPlacesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const places = await Place.findAll({
      where: { category, status: "approved" },
      include: { model: User, as: "user", attributes: ["id", "first_name", "last_name", "email"] },
    });

    return res.status(200).json({ places });
  } catch (error) {
    console.error("Error fetching places by category:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Update a place (only contributor or admin)
const updatePlace = async (req, res) => {
  try {
    const { id: user_id, role } = req.user; // Get logged-in user ID & role
    const { id } = req.params;
    const place = await Place.findByPk(id);

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    // Allow only admin or the original contributor to edit
    if (place.user_id !== user_id && role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to update this place" });
    }

    await place.update(req.body);

    return res.status(200).json({ message: "Place updated successfully", place });
  } catch (error) {
    console.error("Error updating place:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Delete a place (only contributor or admin)
const deletePlace = async (req, res) => {
  try {
    const { id: user_id, role } = req.user; // Get logged-in user ID & role
    const { id } = req.params;
    const place = await Place.findByPk(id);

    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    // Allow only admin or the original contributor to delete
    if (place.user_id !== user_id && role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to delete this place" });
    }

    await place.destroy();

    return res.status(200).json({ message: "Place deleted successfully" });
  } catch (error) {
    console.error("Error deleting place:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createPlace,
  getPlaces,
  getPlacesByCategory,
  updatePlace,
  deletePlace,
};
