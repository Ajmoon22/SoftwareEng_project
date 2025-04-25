import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

export default function Settings() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/settings/user/${userId}`);
        const data = await res.json();
        setUsername(data.username);
        setEmail(data.email);
      } catch (err) {
        toast.error("Failed to load user data");
      }
    };
    fetchUser();
  }, [userId]);

  const updateUsernameAndEmail = async () => {
    try {
      await fetch(`http://localhost:5000/api/settings/username/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const emailRes = await fetch(`http://localhost:5000/api/settings/email/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const emailData = await emailRes.json();
      if (!emailRes.ok) throw new Error(emailData.msg);

      toast.success("Account updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updatePassword = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/settings/password/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      toast.success("Password changed");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/settings/delete/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      toast.success("Account deleted");
      localStorage.clear();
      navigate("/signup");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="settings-container">
      <h2>🛠️ Account Settings</h2>

      {/* Update Name and Email Section */}
      <section className="settings-section">
        <h3>Update Name & Email</h3>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Name"
          className="input-field"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-field"
        />
        <button onClick={updateUsernameAndEmail} className="settings-btn">
          Update
        </button>
      </section>

      {/* Change Password Section */}
      <section className="settings-section">
        <h3>Change Password</h3>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="input-field"
        />
        <button onClick={updatePassword} className="settings-btn">
          Change Password
        </button>
      </section>

      {/* Delete Account Section */}
      <section className="danger-zone">
        <h3>⚠️ Delete Account</h3>
        <input
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="Confirm Password"
          className="input-field"
        />
        <div className="warning">
          <p>Warning: This action is irreversible.</p>
        </div>
        <button className="delete-btn" onClick={deleteAccount}>
          Delete My Account
        </button>
      </section>
    </div>
  );
}
