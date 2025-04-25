const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const Bid = require("../models/Bid");

// Create new request
router.post("/", async (req, res) => {
  const io = req.app.get("socketio");
  const { user, pickup, destination, description, customerPrice } = req.body;

  try {
    const existing = await Request.findOne({ 
      user, 
      status: { $in: ["active", "confirmed", "picked up", "on the way"] } // ✅ Only block if truly active
    });
    if (existing) return res.status(400).json({ msg: "You already have an active request." });

    const newRequest = new Request({
      user,
      pickup,
      destination,
      description,
      customerPrice: parseFloat(customerPrice) || 0
    });

    await newRequest.save();

    io.emit("new_request", newRequest);
    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all requests for a specific customer
router.get("/user/:userId", async (req, res) => {
  try {
    const requests = await Request.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "selectedBid",
        model: "Bid"
      })
      .populate("assignedDeliveryPerson", "username phone");

    res.json(requests);
  } catch (err) {
    console.error("User requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get active requests for delivery dashboard
router.get("/active", async (req, res) => {
  const { deliveryPersonId } = req.query;
  try {
    const available = await Request.find({
      status: "active",
      selectedBid: null,
    }).populate("user", "username phone");

    const assigned = await Request.find({
      assignedDeliveryPerson: deliveryPersonId,
      status: { $ne: "completed" },
    })
      .populate("user", "username phone")
      .populate("bids.deliveryPerson", "username");

    res.json([...assigned, ...available]);
  } catch (err) {
    console.error("Active fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get one request with full details
router.get("/:requestId", async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId)
      .populate("assignedDeliveryPerson", "username phone")
      .populate({
        path: "selectedBid",
        model: "Bid"
      });

    if (!request) return res.status(404).json({ msg: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error(`Error fetching request ${req.params.requestId}:`, err);
    res.status(500).json({ msg: "Server error fetching request details" });
  }
});

// Accept a bid
router.post("/select-bid", async (req, res) => {
  const io = req.app.get("socketio");
  const { userId, bidId } = req.body;

  if (!userId || !bidId) {
    return res.status(400).json({ msg: "User ID and Bid ID are required." });
  }

  try {
    const request = await Request.findOne({
      user: userId,
      status: { $in: ["pending", "active"] },
    });

    if (!request) return res.status(404).json({ msg: "Eligible request not found" });

    const selectedBid = await Bid.findById(bidId);
    if (!selectedBid || selectedBid.request.toString() !== request._id.toString()) {
      return res.status(400).json({ msg: "Invalid bid selection" });
    }

    request.selectedBid = selectedBid._id;
    request.assignedDeliveryPerson = selectedBid.deliveryPerson;
    request.status = "confirmed";
    await request.save();

    io.emit("bid_accepted", {
      requestId: request._id,
      deliveryPersonId: selectedBid.deliveryPerson,
      bid: selectedBid,
    });

    const populated = await Request.findById(request._id)
      .populate({
        path: "selectedBid",
        model: "Bid"
      })
      .populate("assignedDeliveryPerson", "username phone");

    res.json(populated);
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
    )
      .populate({
        path: "selectedBid",
        model: "Bid"
      })
      .populate("assignedDeliveryPerson", "username phone");

    io.emit("request_status_updated", updated);
    res.json(updated);
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ msg: "Failed to update status" });
  }
});

// Cancel request (only if bid not yet accepted)
router.patch("/:requestId/cancel", async (req, res) => {
  const io = req.app.get("socketio");
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.status !== "active") {
      return res.status(400).json({ msg: "Cannot cancel after bid accepted" });
    }

    request.status = "canceled";
    await request.save();

    io.emit("request_canceled", { requestId: request._id });
    res.json({ msg: "Request canceled" });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
