// routes/bids.js
const express = require("express");
const Bid = require("../models/Bid");
// You might not need Request model here anymore if not pushing to request.bids
// const Request = require("../models/Request");

const router = express.Router();

// POST a new bid for a request
router.post("/", async (req, res) => {
    // --- Get io instance from Express app ---
    const io = req.app.get("socketio");
    // ----------------------------------------
    const { requestId, deliveryPerson, price, eta } = req.body;

    // Optional validation
    if (!requestId || !deliveryPerson || !price || !eta) {
        return res.status(400).json({ msg: "Missing required bid fields." });
    }

    try {
        const bid = new Bid({
            request: requestId,
            deliveryPerson: deliveryPerson,
            price: parseFloat(price), // Store price as number
            eta: eta
        });
        await bid.save(); // Save the bid document
        console.log("Saved new Bid:", bid); // Log the saved document

        // --- Emit socket event using correct variables ---
        if (io) { // Check if io instance exists
            // Use the 'bid' variable here, not 'savedBid'
            io.emit('bid_placed', { requestId: bid.request, bid: bid });
            console.log(`Emitted 'bid_placed' for request ${bid.request}`);
        } else {
            console.warn("Socket.io instance (io) not found on app. Cannot emit 'bid_placed'.");
        }
        // ----------------------------------------------

        /* // Commented out: Logic to push bid into request.bids array
            const request = await Request.findById(requestId);
            // ... push logic ...
        */

        res.status(201).json(bid); // Respond with the created bid

    } catch (err) {
        console.error("Error creating bid in POST /api/bids:", err); // Log the actual error on the server
        res.status(500).json({ msg: "Error creating bid", error: err.message }); // Send generic error
    }
});

// GET all bids for a request (Keep this as is)
router.get("/:requestId", async (req, res) => {
    try {
        const bids = await Bid.find({ request: req.params.requestId }).populate("deliveryPerson", "username email");
        res.json(bids);
    } catch (err) {
         console.error(`Error fetching bids for ${req.params.requestId}:`, err);
        res.status(500).json({ msg: "Failed to fetch bids" });
    }
});

module.exports = router;