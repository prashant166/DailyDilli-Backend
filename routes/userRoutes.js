const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  signUp,
  signIn,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// User Registration
router.post("/signup", signUp);

// User Login
router.post("/signin", signIn);

// Get all users
router.get("/", getUsers);

// Get a user by ID
router.get("/:id", getUserById);

// Update a user
router.put("/:id", updateUser);

// Delete a user
router.delete("/:id", deleteUser);

module.exports = router;
