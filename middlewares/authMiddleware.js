const jwt = require("jsonwebtoken");
const { User } = require("../models");

const secretKey = process.env.JWT_SECRET || "dh8923h83hjd9j2sj9pj29j";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, secretKey);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // ✅ Attach user to req object
    console.log("Authenticated User:", req.user); // Debugging log
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ error: "Authorization failed" });
  }
};

module.exports = authMiddleware;
