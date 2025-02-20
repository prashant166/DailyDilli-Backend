const express = require("express");
const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Middleware
app.use(bodyParser.json());

// Use "/api/users" as the base route
app.use("/api/users", userRoutes);

// Database Connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST_URL,
  dialect: process.env.DB_DIALECT,
});

// Test DB Connection
sequelize.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.error("Database connection failed:", err));

// Simple route
app.get("/", (req, res) => {
  res.send("Daily Dilli API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
