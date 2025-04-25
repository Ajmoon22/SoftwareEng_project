// routes/ratings.js
const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");
const User = require("../models/User");

router.post("/", async (req, res) => {
  const { deliveryPersonId, customerId, rating } = req.body;

  if (!deliveryPersonId || !customerId || !rating) {
    return res.status(400).json({ msg: "Missing required fields." });
  }

  try {
    // Save the rating
    const newRating = new Rating({
      deliveryPerson: deliveryPersonId,
      customer: customerId,
      rating: parseFloat(rating),
    });
    await newRating.save();

    // Efficiently update delivery person's totalRating and numRatings
    const user = await User.findById(deliveryPersonId);
    if (!user) return res.status(404).json({ msg: "Delivery person not found." });

    user.totalRating += rating;
    user.numRatings += 1;
    await user.save();

    res.status(201).json({
      msg: "Rating submitted successfully.",
      average: (user.totalRating / user.numRatings).toFixed(1),
    });
  } catch (err) {
    console.error("Rating submission error:", err);
    res.status(500).json({ msg: "Server error saving rating." });
  }
});

module.exports = router;
