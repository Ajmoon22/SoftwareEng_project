// routes/complaints.js
const express = require("express");
const Complaint = require("../models/Complaint");
const User = require("../models/User");

const router = express.Router();

// POST /api/complaints → user submits a complaint
router.post("/", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  try {
    const complaint = new Complaint({ user: userId, message });
    await complaint.save();
    res.status(201).json({ msg: "Complaint submitted", complaint });
  } catch (err) {
    console.error("Complaint error:", err);
    res.status(500).json({ msg: "Server error submitting complaint" });
  }
});

// GET /api/complaints → Admin fetches all complaints
router.get("/", async (req, res) => {
  const { adminId } = req.query;

  try {
    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const complaints = await Complaint.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Fetching complaints error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PATCH /api/complaints/:id → Mark a complaint as resolved
router.patch("/:id", async (req, res) => {
  const { adminId } = req.body;

  try {
    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    ).populate("user", "username email");

    res.json({ msg: "Complaint marked as resolved", complaint: updated });
  } catch (err) {
    console.error("Updating complaint error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
