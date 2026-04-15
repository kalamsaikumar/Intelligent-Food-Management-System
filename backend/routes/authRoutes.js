const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// REGISTER API
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create new user
    // const newUser = new User({
    //   name,
    //   email,
    //   password
    // });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword
    });


    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

// UPDATE PROFILE
router.put("/profile", authMiddleware, async (req, res) => {
  const { name, phone, about, avatar } = req.body;

  await User.findByIdAndUpdate(req.userId, {
    name,
    phone,
    about,
    avatar
  });

  res.json({ message: "Profile updated successfully" });
});


// CHANGE PASSWORD
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findById(req.userId);

    if (user.email !== email) {
      return res.status(400).json({
        message: "Email does not match"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // ✅ FIX (NO VALIDATION ERROR)
    await User.updateOne(
      { _id: req.userId },
      { $set: { password: hashed } }
    );

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
});

router.put("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;


    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ UPDATE WITHOUT VALIDATION ERROR
    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    res.json({
      message: "Password updated successfully"
    });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
});


module.exports = router;
