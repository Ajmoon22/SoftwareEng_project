// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 1. Import MUI ThemeProvider and CssBaseline
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box'; // Optional: For layout structuring

// 2. Import your theme (assuming it's saved in src/theme.js)
import strictBlackAndWhiteTheme from './theme'; // Adjust path if needed

// --- Your Component Imports ---
import HomePage from "./components/homepage/HomePage";
import LoginPage from "./components/loginpage/LoginPage";
import SignUpPage from "./components/signuppage/SignUpPage";
import CustomerBiddings from "./components/customerbiddings/CustomerBiddings";
import CustomerRequests from "./components/customerrequests/CustomerRequests";
import DeliveryDashboard from "./components/deliverydashboard/DeliveryDashboard";
import Navbar from "./components/navbar/Navbar"; // Your existing Navbar
import Footer from "./components/footer/Footer"; // Your existing Footer
import RoleSelectionPage from "./components/roleselection/RoleSelectionPage";
import CustomerDashboard from "./components/customerdashboard/CustomerDashboard";
import Settings from "./components/settings/Settings";
import OrderTrackingPage from './components/ordertracking/OrderTrackingPage'; // Adjust path if needed

// --- End Component Imports ---

// Your RequireAuth component (no changes needed here)
function RequireAuth({ children }) {
  const isAuthenticated = !!localStorage.getItem("userId");
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    // 3. Wrap the *entire content* inside Router with ThemeProvider
    <ThemeProvider theme={strictBlackAndWhiteTheme}>
      <CssBaseline /> {/* Apply baseline styles and theme background */}
      <Router>
        {/* Use a Box to manage layout potentially, e.g., sticky footer */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* 4. Navbar is now INSIDE ThemeProvider */}
          {/* <Navbar /> */}

          {/* Main content area */}
          <Box component="main" sx={{ flexGrow: 1, py: 3 }}> {/* Add some padding */}
            <Routes>
              {/* --- Your Routes (no changes needed here) ---*/}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              <Route path="/customer-bidding" element={
                <RequireAuth><CustomerBiddings /></RequireAuth>
              } />
              <Route path="/customer-requests" element={
                <RequireAuth><CustomerRequests /></RequireAuth>
              } />
              <Route path="/select-role" element={
                <RequireAuth><RoleSelectionPage /></RequireAuth>
              } />
              <Route path="/delivery-dashboard" element={
                <RequireAuth><DeliveryDashboard /></RequireAuth>
              } />
              <Route path="/customer-dashboard" element={
                <RequireAuth><CustomerDashboard /></RequireAuth>
              } />
              <Route path="/settings" element={
                <RequireAuth><Settings /></RequireAuth>
              } />
              <Route
                path="/track-order/:requestId" // Define parameter :requestId
                element={
                  <RequireAuth>
                    <OrderTrackingPage />
                  </RequireAuth>
                }
              />
              {/* --- End Routes --- */}
            </Routes>
          </Box>

          {/* 5. Footer is now INSIDE ThemeProvider */}
          {/* Optional: Add sx={{ mt: 'auto' }} to push footer down if needed */}
          {/* <Footer /> */}
        </Box>

        {/* ToastContainer can remain here, it doesn't strictly need the theme context */}
        <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            // theme="light" // Or "dark" or "colored" - you might want to match your app theme
         />
      </Router>
    </ThemeProvider>
  );
}

export default App;