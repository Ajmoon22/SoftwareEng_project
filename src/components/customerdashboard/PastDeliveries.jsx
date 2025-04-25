// src/components/customerdashboard/PastDeliveries.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./PastDeliveries.css";

function PastDeliveries() {
  const userId = localStorage.getItem("userId");
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedDeliveries = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/requests/user/${userId}`);
        const data = await res.json();
        const completed = data.filter((r) => r.status === "completed");
        setDeliveries(completed);
      } catch (err) {
        console.error("Failed to fetch past deliveries", err);
        toast.error("Error loading past deliveries");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedDeliveries();
  }, [userId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="past-deliveries-page">
      <h2>📦 Past Deliveries</h2>
      {deliveries.length === 0 ? (
        <p>No completed deliveries yet.</p>
      ) : (
        deliveries.map((d) => (
          <div key={d._id} className="past-delivery-card">
            <p><strong>From:</strong> {d.pickup}</p>
            <p><strong>To:</strong> {d.destination}</p>
            <p><strong>Description:</strong> {d.description}</p>
            <p><strong>Status:</strong> {d.status}</p>
            <p><strong>Delivered By:</strong> {d.assignedDeliveryPerson?.username || "N/A"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default PastDeliveries;
