"use strict";
const { PlaceSafetyFeedback, User } = require("../models");

// 📌 Submit safety feedback for a place
const submitSafetyFeedback = async (req, res) => {
  try {
    const { place_id, felt_safe, comment } = req.body;
    const user_id = req.user.id;

    if (!place_id || typeof felt_safe !== "boolean") {
      return res.status(400).json({ error: "Place ID and felt_safe (true/false) are required" });
    }

    // ✅ Check for existing feedback by this user for this place
    const existing = await PlaceSafetyFeedback.findOne({
      where: { user_id, place_id },
    });

    if (existing) {
      return res.status(409).json({
        message: "You have already submitted feedback for this place.",
        feedback: existing,
      });
    }

    const feedback = await PlaceSafetyFeedback.create({
      user_id,
      place_id,
      felt_safe,
      comment,
    });

    return res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// 📌 Get female-only safety stats for a place
const getSafetyStats = async (req, res) => {
  try {
    const { placeId } = req.params;

    const feedbacks = await PlaceSafetyFeedback.findAll({
      where: { place_id: placeId },
      include: {
        model: User,
        where: { gender: "female" },
        attributes: [], // exclude user fields
      },
    });

    const total = feedbacks.length;
    const safe = feedbacks.filter((f) => f.felt_safe).length;
    const percent = total > 0 ? Math.round((safe / total) * 100) : 0;

    return res.status(200).json({
      place_id: placeId,
      total_female_responses: total,
      safe_responses: safe,
      percent_felt_safe: percent,
    });
  } catch (error) {
    console.error("Error fetching safety stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  submitSafetyFeedback,
  getSafetyStats,
};
