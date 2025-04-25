const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  price: Number,
  eta: String,
  createdAt: { type: Date, default: Date.now }
});

const requestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pickup: { type: String, required: true },
  destination: { type: String, required: true },
  description: { type: String, required: true },
  customerPrice: { type: Number, required: true},
  status: {
    type: String,
    enum: ["active", "confirmed", "picked up", "on the way", "completed", "canceled"],
    default: "active"
  },
  bids: [bidSchema],
  selectedBid: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  assignedDeliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Request", requestSchema);
