const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const authMiddleware = require("../middleware/authMiddleware");

// ADD CATEGORY
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { name, reminderDays } = req.body;

    const category = new Category({
      name,
      reminderDays,
      userId: req.userId
    });

    await category.save();
    res.json({ message: "Category added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET USER CATEGORIES
router.get("/", authMiddleware, async (req, res) => {
  const categories = await Category.find({ userId: req.userId });
  res.json(categories);
});

module.exports = router;
