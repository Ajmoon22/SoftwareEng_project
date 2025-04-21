// backend/routes/settings.js
const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs"); // make sure it's imported at top if not already

// Update username
router.patch("/username/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { username: req.body.username },
      { new: true }
    );
    res.json({ msg: "Username updated", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update email
router.patch("/email/:userId", async (req, res) => {
  try {
    const emailTaken = await User.findOne({ email: req.body.email });
    if (emailTaken) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { email: req.body.email },
      { new: true }
    );
    res.json({ msg: "Email updated", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update password
router.patch("/password/:userId", async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ msg: "New password is required" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      const updated = await User.findByIdAndUpdate(
        req.params.userId,
        { password: hashedPassword },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      res.json({ msg: "Password updated" });
    } catch (err) {
      console.error("❌ Password update error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  

// Delete account (requires password)
router.post("/delete/:userId", async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ msg: "Incorrect password" });

    await user.deleteOne();
    res.json({ msg: "Account deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;