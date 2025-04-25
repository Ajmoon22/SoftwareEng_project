// src/components/deliverydashboard/DeliveryDashboard.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import "./DeliveryDashboard.css";
import BidModal from "./BidModal";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import Rating from "@mui/material/Rating";

const socket = io("http://localhost:5005");

export default function DeliveryDashboard() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalRequest, setModalRequest] = useState(null);
  const [userRating, setUserRating] = useState(null);

  const deliveryPersonId = localStorage.getItem("userId");
  const justUpdatedId = useRef(null);

  const fetchRequests = useCallback(async () => {
    if (!deliveryPersonId) return;

    try {
      const res = await fetch(`http://localhost:5005/api/requests/active?deliveryPersonId=${deliveryPersonId}`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      toast.error("Failed to fetch delivery requests");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [deliveryPersonId]);

  const fetchUserRating = useCallback(async () => {
    if (!deliveryPersonId) return;
    try {
      const res = await fetch(`http://localhost:5005/api/users/${deliveryPersonId}`);
      const data = await res.json();
      if (res.ok) setUserRating(data.averageRating);
    } catch (err) {
      console.error("Failed to fetch rating", err);
    }
  }, [deliveryPersonId]);

  useEffect(() => {
    fetchRequests();
    fetchUserRating();

    const handleRefetch = () => fetchRequests();

    const handleStatusUpdate = (updatedRequest) => {
      const isMine = updatedRequest?.assignedDeliveryPerson === deliveryPersonId;
      if (isMine && updatedRequest._id !== justUpdatedId.current) {
        toast.info(`📍 Status updated for ${updatedRequest.pickup}`);
      }
      fetchRequests();
    };

    socket.on("new_request", handleRefetch);
    socket.on("bid_accepted", handleRefetch);
    socket.on("request_canceled", handleRefetch);
    socket.on("request_status_updated", handleStatusUpdate);
    socket.on("bid_placed", handleRefetch);

    return () => {
      socket.off("new_request", handleRefetch);
      socket.off("bid_accepted", handleRefetch);
      socket.off("request_canceled", handleRefetch);
      socket.off("request_status_updated", handleStatusUpdate);
      socket.off("bid_placed", handleRefetch);
    };
  }, [fetchRequests, fetchUserRating, deliveryPersonId]);

  const updateStatus = async (requestId, newStatus) => {
    justUpdatedId.current = requestId;

    try {
      const res = await fetch(`http://localhost:5005/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("✅ Status updated");
        await fetchRequests();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.msg || "❌ Failed to update status");
      }
    } catch (err) {
      toast.error("🚨 Network error updating status");
    }
  };

  const assigned = requests.filter(
    r => r.assignedDeliveryPerson === deliveryPersonId && r.status !== "completed"
  );

  const available = requests.filter(
    r => !r.selectedBid && ["pending", "active"].includes(r.status)
  );

  const getNextStatusButton = (r) => {
    switch (r.status?.toLowerCase()) {
      case "confirmed":
        return <button onClick={() => updateStatus(r._id, "picked up")}>Mark as Picked Up</button>;
      case "picked up":
        return <button onClick={() => updateStatus(r._id, "on the way")}>Mark as On The Way</button>;
      case "on the way":
        return <button onClick={() => updateStatus(r._id, "completed")}>Mark as Delivered</button>;
      default:
        return <span>({r.status || "Unknown"})</span>;
    }
  };

  const openModalForRequest = (r) => {
    setModalRequest(r);
    setShowModal(true);
  };

  return (
    <div className="delivery-dashboard-page">
      <h1>📦 Delivery Dashboard</h1>

      {userRating !== null && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Your Rating:</strong>{" "}
          <Rating
            value={parseFloat(userRating)}
            readOnly
            precision={0.1}
            size="small"
          />{" "}
          ({userRating}/5)
        </div>
      )}

      <button onClick={fetchRequests} className="refresh-button">
        {isLoading ? "Refreshing..." : "🔄 Refresh"}
      </button>

      <section>
        <h2>Assigned Deliveries</h2>
        {assigned.length === 0 && <p>No assigned deliveries</p>}
        {assigned.map((r) => (
          <div key={r._id} className="assigned-card">
            <h3>{r.pickup} → {r.destination}</h3>
            <p>{r.description}</p>
            <p><strong>Status:</strong> {r.status}</p>
            <p><strong>Customer:</strong> {r.user?.username || "Unknown"}</p>
            <p><strong>Phone:</strong> {r.user?.phone || "N/A"}</p> {/* ✅ Phone shown here */}
            {getNextStatusButton(r)}
          </div>
        ))}
      </section>

      <section>
        <h2>Available Offers</h2>
        {available.length === 0 && <p>No current offers</p>}
        {available.map((r) => (
          <div key={r._id} className="offer-card">
            <h3>{r.pickup} → {r.destination}</h3>
            <p>{r.description}</p>
            <p><strong>Customer:</strong> {r.user?.username || "Unknown"}</p>
            <button onClick={() => openModalForRequest(r)}>Place Your Bid</button>
          </div>
        ))}
      </section>

      {showModal && modalRequest && (
        <BidModal
          request={modalRequest}
          deliveryPersonId={deliveryPersonId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
