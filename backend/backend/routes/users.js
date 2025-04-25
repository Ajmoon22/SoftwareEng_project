// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/users/:id — returns user info with averageRating
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ msg: "User not found" });

    const averageRating =
      user.numRatings === 0 ? null : (user.totalRating / user.numRatings).toFixed(1);

    res.json({
      ...user,
      averageRating,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
