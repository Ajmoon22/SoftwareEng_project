import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import "./ComplaintManager.css";

export default function ComplaintManager() {
  const [complaints, setComplaints] = useState([]);
  const adminId = localStorage.getItem("userId");

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5005/api/complaints?adminId=${adminId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setComplaints(data);
    } catch (err) {
      toast.error("Failed to fetch complaints");
    }
  }, [adminId]); // ✅

  const markResolved = async (complaintId) => {
    try {
      const res = await fetch(`http://localhost:5005/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      toast.success("Marked as resolved");
      fetchComplaints();
    } catch (err) {
      toast.error("Error resolving complaint");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]); // ✅ no warning

  return (
    <div className="complaint-manager">
      <h2>📢 Complaints</h2>
      {complaints.length === 0 ? (
        <p>No complaints submitted.</p>
      ) : (
        <table className="complaints-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Message</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id}>
                <td>{c.user?.username || "Unknown"}</td>
                <td>{c.user?.email || "N/A"}</td>
                <td>{c.message}</td>
                <td>{c.status}</td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>
                  {c.status === "pending" ? (
                    <button onClick={() => markResolved(c._id)}>Mark Resolved</button>
                  ) : (
                    <span>✅</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
