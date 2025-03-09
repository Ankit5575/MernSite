const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // For password hashing
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields (role is optional)
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the role (default to 'user' if not provided)
    user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      role: role || "user" // Default role is 'user'
    });
    await user.save();

    // Create a JWT payload
    const payload = { 
      id: user._id, 
      role: user.role 
    };

    // Sign the JWT with a 30-day expiration time
    // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

    // Respond with the token and user information (excluding the password)
    res.status(201).json({
      message: "User registered successfully",
      user: { 
        _id: user._id,
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT payload
    const payload = { id: user._id, role: user.role };

    // Sign the JWT with a 30-day expiration time
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

    // Send user and token in the response
    res.status(200).json({
      user: { 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Profile (Protected)
router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;