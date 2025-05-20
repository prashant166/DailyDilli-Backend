const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { Op } = require("sequelize");

const saltRounds = 10;
const secretKey = process.env.JWT_SECRET;
console.log("🔐 JWT_SECRET:", secretKey);
const TOKEN_EXPIRY = "24h"; // Token expires in 24 hours

/**
 * @desc Get all users
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "first_name", "last_name", "email", "travelling_since", "role", "gender", "createdAt"],
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc Get user by ID
 */
const getUserById = async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const user = await User.findByPk(userId, {
      attributes: ["id", "first_name", "last_name", "email", "travelling_since", "role","gender", "createdAt"],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc User Registration (Sign Up)
 */
const signUp = async (req, res) => {
  const { first_name, last_name, email, password, travelling_since, gender } = req.body;

  try {
    if (!first_name || !last_name || !email || !password || !gender) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      travelling_since,
      gender,
      role: "user",
    });

    res.status(201).json({ message: "User registered successfully", userId: user.id });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc User Login (Sign In)
 */
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ error: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secretKey,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Prepare safe user data
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      travelling_since: user.travelling_since,
      gender: user.gender,
    };

    res.status(200).json({
      message: "Sign in successful",
      token,
      userData,
    });
  } catch (error) {
    console.error("Error signing in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * @desc Update User
 */
const updateUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { first_name, last_name, travelling_since, gender } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update user fields if provided
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (travelling_since) user.travelling_since = travelling_since;
    if (gender) user.gender = gender;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc Delete User
 */
const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  signUp,
  signIn,
  updateUser,
  deleteUser,
};
