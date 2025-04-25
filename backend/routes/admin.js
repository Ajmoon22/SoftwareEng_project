// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware to check admin privilege
const requireAdmin = async (req, res, next) => {
  const { adminId } = req.body;
  const admin = await User.findById(adminId);
  if (!admin || !admin.isAdmin) {
    return res.status(403).json({ msg: "Access denied: Admins only" });
  }
  next();
};

// POST /api/admin/users → fetch all users
router.post("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username email isBlocked");
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PATCH /api/admin/users/:userId/block → block/unblock user
router.patch("/users/:userId/block", requireAdmin, async (req, res) => {
  const { block } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBlocked: !!block },
      { new: true }
    );
    res.json({ msg: `User ${block ? "blocked" : "unblocked"}`, user });
  } catch (err) {
    console.error("Block toggle error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
