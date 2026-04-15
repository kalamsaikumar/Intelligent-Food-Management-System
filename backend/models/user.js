const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ===== BASIC AUTH DETAILS =====
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  // ===== PROFILE DETAILS =====
  phone: {
    type: String,
    required: false,
    match: [/^\+91\d{10}$/, "Phone number must be +91 followed by 10 digits"]
  },

  about: {
    type: String,
    required: false,
    maxlength: 300
  },

  avatar: {
    type: String,   // URL or avatar image reference
    required: false
  }

}, {
  timestamps: true   // createdAt & updatedAt
});

module.exports = mongoose.model("User", userSchema);
