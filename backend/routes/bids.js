// routes/bids.js
const express = require("express");
const Bid = require("../models/Bid");
const User = require("../models/User");

const router = express.Router();

// POST a new bid
router.post("/", async (req, res) => {
    const io = req.app.get("socketio");
    const { requestId, deliveryPerson, price, eta } = req.body;

    if (!requestId || !deliveryPerson || !price || !eta) {
        return res.status(400).json({ msg: "Missing required bid fields." });
    }

    try {
        const bid = new Bid({
            request: requestId,
            deliveryPerson,
            price: parseFloat(price),
            eta
        });
        await bid.save();

        // Populate delivery person details with rating calculation
        const deliveryUser = await User.findById(deliveryPerson);
        const averageRating = deliveryUser.numRatings > 0
            ? (deliveryUser.totalRating / deliveryUser.numRatings).toFixed(1)
            : null;

        const populatedBid = {
            ...bid.toObject(),
            deliveryPerson: {
                _id: deliveryUser._id,
                username: deliveryUser.username,
                email: deliveryUser.email,
                averageRating
            }
        };

        if (io) {
            io.emit("bid_placed", { requestId, bid: populatedBid });
        }

        res.status(201).json(populatedBid);
    } catch (err) {
        console.error("Error creating bid:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET all bids for a request
router.get("/:requestId", async (req, res) => {
    try {
        const bids = await Bid.find({ request: req.params.requestId }).populate("deliveryPerson", "username email totalRating numRatings");

        const enriched = bids.map(b => {
            const avg = b.deliveryPerson.numRatings > 0
                ? (b.deliveryPerson.totalRating / b.deliveryPerson.numRatings).toFixed(1)
                : null;
            return {
                ...b.toObject(),
                deliveryPerson: {
                    _id: b.deliveryPerson._id,
                    username: b.deliveryPerson.username,
                    email: b.deliveryPerson.email,
                    averageRating: avg
                }
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error("Error fetching bids:", err);
        res.status(500).json({ msg: "Failed to fetch bids" });
    }
});

module.exports = router;
