const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// GET ALL NOTIFICATIONS
router.get("/", authMiddleware, async (req, res) => {
  const notes = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(notes);
});

// MARK ONE AS READ
// router.delete("/:id", authMiddleware, async (req, res) => {
//   await Notification.findOneAndDelete({
//     _id: req.params.id,
//     userId: req.userId
//   });
//   res.json({ message: "Notification removed" });
// });

// MARK ONE AS READ (DO NOT DELETE)
router.put("/:id/read", authMiddleware, async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { isRead: true }
  );

  res.json({ message: "Notification marked as read" });
});

// MARK ALL AS READ
// router.delete("/", authMiddleware, async (req, res) => {
//   await Notification.deleteMany({ userId: req.userId });
//   res.json({ message: "All notifications cleared" });
// });

// MARK ALL AS READ
router.put("/read-all", authMiddleware, async (req, res) => {
  await Notification.updateMany(
    { userId: req.userId },
    { isRead: true }
  );

  res.json({ message: "All notifications marked as read" });
});


module.exports = router;
