// const mongoose = require("mongoose");

// const categorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   reminderDays: {
//     type: Number,
//     required: true
//   }
// });

// module.exports = mongoose.model("Category", categorySchema);
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  reminderDays: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Category", categorySchema);
