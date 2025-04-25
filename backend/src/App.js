// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import strictBlackAndWhiteTheme from './theme';

// --- Component Imports ---
import HomePage from "./components/homepage/HomePage";
import LoginPage from "./components/loginpage/LoginPage";
import SignUpPage from "./components/signuppage/SignUpPage";
import CustomerBiddings from "./components/customerbiddings/CustomerBiddings";
import CustomerRequests from "./components/customerrequests/CustomerRequests";
import DeliveryDashboard from "./components/deliverydashboard/DeliveryDashboard";
import RoleSelectionPage from "./components/roleselection/RoleSelectionPage";
import CustomerDashboard from "./components/customerdashboard/CustomerDashboard";
import Settings from "./components/settings/Settings";
import OrderTrackingPage from './components/ordertracking/OrderTrackingPage';
import PastDeliveries from "./components/customerdashboard/PastDeliveries";
import AdminDashboard from "./components/admindashboard/AdminDashboard";
import ComplaintForm from "./components/complaint/ComplaintForm"; // ✅ NEW

// --- Auth Guards ---
function RequireAuth({ children }) {
  const isAuthenticated = !!localStorage.getItem("userId");
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function RequireAdmin({ children }) {
  const isAuthenticated = !!localStorage.getItem("userId");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAuthenticated && isAdmin ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={strictBlackAndWhiteTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              <Route path="/select-role" element={<RequireAuth><RoleSelectionPage /></RequireAuth>} />
              <Route path="/delivery-dashboard" element={<RequireAuth><DeliveryDashboard /></RequireAuth>} />
              <Route path="/customer-dashboard" element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
              <Route path="/customer-bidding" element={<RequireAuth><CustomerBiddings /></RequireAuth>} />
              <Route path="/customer-requests" element={<RequireAuth><CustomerRequests /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/track-order/:requestId" element={<RequireAuth><OrderTrackingPage /></RequireAuth>} />
              <Route path="/past-deliveries" element={<RequireAuth><PastDeliveries /></RequireAuth>} />
              <Route path="/complaint" element={<RequireAuth><ComplaintForm /></RequireAuth>} /> {/* ✅ New Route */}

              <Route path="/admin-dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            </Routes>
          </Box>
        </Box>
        <ToastContainer position="top-right" autoClose={2000} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
