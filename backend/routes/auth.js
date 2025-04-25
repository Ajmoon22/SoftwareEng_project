const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password || !phone) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: "User already exists" });

  const user = new User({ username, email, password, phone });
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.status(201).json({ 
    token, 
    user: { 
      _id: user._id,
      username, 
      email,
      phone,               
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked
    } 
  });
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

  if (user.isBlocked) return res.status(403).json({ msg: "User is blocked by admin." });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ 
    token, 
    user: { 
      _id: user._id,
      username: user.username,
      email,
      isAdmin: user.isAdmin,     
      isBlocked: user.isBlocked  
    } 
  });
});

// Update user info (name or email)
router.patch("/update/:id", async (req, res) => {
  const { username, email } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true }
    );
    res.json({
      msg: "User info updated",
      user: { _id: updated._id, username: updated.username, email: updated.email },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update password
router.patch("/update-password/:id", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ msg: "Old password incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete account with password check
router.delete("/delete/:id", async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Password incorrect" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Account deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
