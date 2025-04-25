import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ComplaintManager from "./ComplaintManager";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const adminId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5005/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  }, [adminId]); 

  const toggleBlock = async (userId, block) => {
    try {
      const res = await fetch(`http://localhost:5005/api/admin/users/${userId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, block }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      toast.success(data.msg);
      loadUsers();
    } catch (err) {
      toast.error("Failed to update user block status");
    }
  };

  const promoteToAdmin = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5005/api/admin/users/${userId}/promote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      toast.success(data.msg);
      loadUsers();
    } catch (err) {
      toast.error("Failed to promote user");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out");
    navigate("/login");
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]); 

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🛠️ Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <h2>👥 User Management</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Blocked</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.isBlocked ? "Yes" : "No"}</td>
              <td>{u.isAdmin ? "Yes" : "No"}</td>
              <td>
                <button
                  className={u.isBlocked ? "unblock-btn" : "block-btn"}
                  onClick={() => toggleBlock(u._id, !u.isBlocked)}
                >
                  {u.isBlocked ? "Unblock" : "Block"}
                </button>
                {!u.isAdmin && (
                  <button className="promote-btn" onClick={() => promoteToAdmin(u._id)}>
                    Promote to Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ComplaintManager />
    </div>
  );
}
