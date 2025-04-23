const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const Bid = require("../models/Bid"); // <-- ADD THIS LINE TO IMPORT THE BID MODEL



// Create a new request (only one active per customer)
router.post("/", async (req, res) => {
  const io = req.app.get("socketio");
  const { user, pickup, destination, description } = req.body;
  try {
    const existing = await Request.findOne({ user, status: { $ne: "completed" } });
    if (existing) return res.status(400).json({ msg: "You already have an active request." });

    const newRequest = new Request({ user, pickup, destination, description });
    await newRequest.save();

    io.emit("new_request", newRequest); // Notify delivery dashboards
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all requests for a specific customer (customer dashboard)
router.get("/user/:userId", async (req, res) => {
  try {
    const requests = await Request.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error("User requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all active requests for delivery dashboard
router.get("/active", async (req, res) => {
  const { deliveryPersonId } = req.query;
  try {
    const available = await Request.find({
      status: "active",
      selectedBid: null
    });
    const assigned = await Request.find({
      assignedDeliveryPerson: deliveryPersonId,
      status: { $ne: "completed" }
    }).populate("bids.deliveryPerson", "username");
    res.json([...assigned, ...available]);
  } catch (err) {
    console.error("Active fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


router.get("/:requestId", async (req, res) => {
  try {
      const request = await Request.findById(req.params.requestId)
          // Populate driver's username from the User collection
          .populate('assignedDeliveryPerson', 'username')
          // Populate the selected Bid document
          .populate('selectedBid');

      if (!request) {
          return res.status(404).json({ msg: "Request not found" });
      }
      // Check if selectedBid was populated successfully (it might be null if populate failed)
      // If selectedBid was just an ID, you might need to fetch Bid details separately
      // But populate should work if schema refs are correct.

      res.json(request); // Send the populated request object

  } catch (err) {
      console.error(`Error fetching request ${req.params.requestId}:`, err);
      res.status(500).json({ msg: "Server error fetching request details" });
  }
});

// Submit a bid
// router.post("/:requestId/bid", async (req, res) => {
//   const io = req.app.get("socketio");
//   const { deliveryPerson, price, eta } = req.body;
//   try {
//     const request = await Request.findById(req.params.requestId);
//     if (!request) return res.status(404).json({ msg: "Request not found" });

//     request.bids.push({ deliveryPerson, price, eta });
//     await request.save();

//     io.emit("new_bid", { requestId: request._id }); // Notify customer dashboard
//     res.json({ msg: "Bid submitted successfully." });
//   } catch (err) {
//     console.error("Submit bid error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // Get all bids for a specific request
// router.get("/:requestId/bids", async (req, res) => {
//   try {
//     const request = await Request.findById(req.params.requestId).populate("bids.deliveryPerson", "username email");
//     if (!request) return res.status(404).json({ msg: "Request not found" });
//     res.json(request.bids || []);
//   } catch (err) {
//     console.error("Bids fetch error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// Accept a bid
router.post("/select-bid", async (req, res) => {
  const io = req.app.get("socketio"); // Get socket instance
  const { userId, bidId } = req.body;

  // Basic input validation
  if (!userId || !bidId) {
    return res.status(400).json({ msg: "User ID and Bid ID are required." });
  }

  try {
    // 1. Find the user's request that is eligible for bid acceptance
    //    (Should be pending or active, not already confirmed/completed)
    const request = await Request.findOne({
      user: userId,
      status: { $in: ["pending", "active"] } // Allow accepting bids on pending or active requests
    });

    if (!request) {
      console.log(`Select Bid Error: No pending/active request found for user ${userId}`);
      // It's possible the request status changed, or it doesn't exist.
      // Send a slightly more informative message if possible.
      return res.status(404).json({ msg: "Eligible request not found for this user." });
    }

    // 2. Find the specific Bid document from the 'bids' collection
    const selectedBid = await Bid.findById(bidId);

    // 3. Check if the bid was found in the Bid collection
    if (!selectedBid) {
      console.log(`Select Bid Error: Bid document not found with ID ${bidId}`);
      return res.status(404).json({ msg: "Bid not found." }); // Bid does not exist
    }

    // 4. Verify that the found bid belongs to the user's request
    if (selectedBid.request.toString() !== request._id.toString()) {
       console.log(`Select Bid Error: Bid ${bidId} belongs to request ${selectedBid.request}, not user's request ${request._id}`);
       return res.status(400).json({ msg: "Bid does not belong to this request." });
    }

    // 5. Update the Request document
    request.selectedBid = selectedBid._id;             // Store reference to the Bid document
    request.assignedDeliveryPerson = selectedBid.deliveryPerson; // Get delivery person from the Bid document
    request.status = "confirmed";                      // Update request status

    await request.save(); // Save the updated Request

    // --- Emit socket event ---
    io.emit("bid_accepted", { // Notify relevant parties
      requestId: request._id,
      deliveryPersonId: selectedBid.deliveryPerson, // Send DP ID
      bid: selectedBid // Optionally send the accepted bid details
    });

    console.log(`Bid ${bidId} accepted for request ${request._id}`);
    res.json({ msg: "Bid accepted." }); // Send success response

  } catch (err) {
    console.error("Select bid error:", err);
    res.status(500).json({ msg: "Server error during bid selection." });
  }
});



// Update request status
router.patch("/:requestId/status", async (req, res) => {
  const io = req.app.get("socketio");
  const { status } = req.body;
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.requestId,
      { status },
      { new: true }
    );
    io.emit("request_status_updated", updated);
    res.json(updated);
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ msg: "Failed to update status" });
  }
});

// Cancel a request
router.patch("/:requestId/cancel", async (req, res) => {
  const io = req.app.get("socketio");
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.status !== "active") {
      return res.status(400).json({ msg: "Cannot cancel request after a bid has been accepted." });
    }

    request.status = "canceled";
    await request.save();

    io.emit("request_canceled", { requestId: request._id });
    res.json({ msg: "Request canceled successfully." });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
