// src/components/roleselection/RoleSelectionPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelectionPage.css";

function RoleSelectionPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";

  const handleSelect = (role) => {
    localStorage.setItem("role", role);
    if (role === "customer") {
      navigate("/customer-dashboard");
    } else if (role === "delivery") {
      navigate("/delivery-dashboard");
    }
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleComplaintClick = () => {
    navigate("/complaint");
  };

  return (
    <>
      <main>
        <header className="customer-dashboard-header">
          <div className="customer-dashboard-logo">Campus Cart</div>
          <div className="customer-dashboard-nav-icons">
            <button className="nav-button" onClick={handleSettingsClick}>⚙️ Settings</button>
            <button className="nav-button" onClick={handleLogoutClick}>🚪 Logout</button>
          </div>
        </header>

        <h1 style={{ color: "black" }}>Welcome, {username || "Guest"}!</h1>
        <p className="subtitle" style={{ color: "black" }}>Choose how you want to use Campus Cart today.</p>

        <div className="roles">
          <div className="role-card" onClick={() => handleSelect("customer")}>
            <div className="role-icon">🛍️</div>
            <div className="role-title">I'm a Customer</div>
            <div className="role-desc">
              Browse menus, order food, request deliveries from shops, and get everything brought directly to your dorm or class.
            </div>
            <button className="select-btn">Select Customer</button>
          </div>

          <div className="role-card" onClick={() => handleSelect("delivery")}>
            <div className="role-icon">🚴‍♂️</div>
            <div className="role-title">I'm a Delivery Person</div>
            <div className="role-desc">
              Join the Campus Cart delivery team and start earning money on your own schedule. Get notified of nearby deliveries and help fellow students.
            </div>
            <button className="select-btn">Select Delivery</button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button className="nav-button" style={{ backgroundColor: "#d32f2f", color: "#fff" }} onClick={handleComplaintClick}>
            📝 Register a Complaint
          </button>
        </div>
      </main>

      <footer>
        © {new Date().getFullYear()} Campus Cart
      </footer>
    </>
  );
}

export default RoleSelectionPage;