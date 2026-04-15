
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();



// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("Intelligent Food Management Backend Running");
});

const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);


const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


