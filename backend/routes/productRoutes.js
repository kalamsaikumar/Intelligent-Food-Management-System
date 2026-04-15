const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Product = require("../models/product");
const Category = require("../models/category");
const Notification = require("../models/Notification");


// ADD PRODUCT
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productName, category, expiryDate, stockCount, userId } = req.body;

    const product = new Product({
      productName,
      category,
      expiryDate,
      stockCount,
      userId: req.userId
    });

    await product.save();
    res.json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================GET PRODUCTS ROUTE==================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId });
    const categories = await Category.find({ userId: req.userId });

    const today = new Date();
    const processedProducts = [];

    for (const product of products) {
      const expiryDate = new Date(product.expiryDate);

      const daysLeft = Math.ceil(
        (expiryDate - today) / (1000 * 60 * 60 * 24)
      );

      const categoryObj = categories.find(
        c => c.name === product.category
      );

      const reminderDays = categoryObj
        ? categoryObj.reminderDays
        : 7;

      let status = "";
      let color = "";
      let icon = "";
      let alert = "";

      if (daysLeft <= 0) {
        status = "Expired";
        color = "red";
        icon = "🔴";
        alert = "⚠️ Product expired!";
      } else if (daysLeft <= reminderDays) {
        status = "Expiring Soon";
        color = "orange";
        icon = "🟠";
        alert = `⏰ Expiring in ${daysLeft} days`;

        // 🔔 NOTIFICATION LOGIC (SAFE HERE)
        const msg = `${product.productName} has ${daysLeft} day${daysLeft > 1 ? "s" : ""} to expire`;

        // get today's date (YYYY-MM-DD)
      const todayDate = new Date().toISOString().split("T")[0];

      const exists = await Notification.findOne({
        userId: req.userId,
        productId: product._id,
        notificationDate: todayDate
      });

      if (!exists) {
        await Notification.create({
          userId: req.userId,
          productId: product._id,
          message: msg,
          notificationDate: todayDate,
          isRead: false
        });
      }
      } else {
        status = "Active";
        color = "green";
        icon = "🟢";
        alert = "✅ Fresh product";
      }

      processedProducts.push({
        _id: product._id,
        productName: product.productName,
        category: product.category,
        stockCount: product.stockCount,
        daysLeft,
        status,
        color,
        icon,
        alert
      });
    }

    res.json(processedProducts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// REDUCE STOCK (SELL PRODUCT)
// REDUCE STOCK (SELL)
// router.put("/sell/:id", authMiddleware, async (req, res) => {
//   try {
//     const { quantity } = req.body;

//     const product = await Product.findOne({
//       _id: req.params.id,
//       userId: req.userId
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // 🔒 EXPIRED PRODUCT CHECK (NO EXTRA VARIABLES NEEDED)
//     if (product.expiryDate < new Date()) {
//       return res.status(400).json({
//         message: "Cannot sell expired product"
//       });
//     }

//     if (quantity > product.stockCount) {
//       return res.status(400).json({ message: "Insufficient stock" });
//     }

//     product.stockCount -= quantity;
//     await product.save();

//     res.json({ message: "Stock updated successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.put("/sell/:id", authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prevent selling expired product
    if (product.expiryDate < new Date()) {
      return res.status(400).json({
        message: "Cannot sell expired product"
      });
    }

    if (quantity > product.stockCount) {
      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    product.stockCount -= quantity;

    // 🔥 DELETE IF STOCK IS ZERO
    if (product.stockCount <= 0) {
      await Product.deleteOne({ _id: product._id });

      return res.json({
        message: "Product sold out and removed"
      });
    }

    await product.save();

    res.json({
      message: "Stock updated successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// DELETE PRODUCT
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId   // important: only owner can delete
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// UPDATE PRODUCT
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { productName, category, expiryDate, stockCount } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { productName, category, expiryDate, stockCount },
      { new: true }
    );

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET SINGLE PRODUCT (for Edit)
router.get("/single/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
