import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Stack } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import "./HomePage.css"; 
import campusCartImage from "../../assets/bikelogo.png"; // Assuming the image path is correct

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Right Section: Image */}
        <div className="home-image">
          <img
            src={campusCartImage} 
            alt="Scooter Delivery"
            className="image animated-logo"
          />
        </div>

        {/* Left Section: Text and Buttons */}
        <div className="home-text">
          <h1 className="home-title">CAMPUS CART</h1>
          <p className="home-subtitle">Your Campus, Your Delivery, Your Way!</p>
          <p className="home-description">Fast, Fresh, Delivered to Your Campus</p>
          
          {/* Buttons Section */}
          <Stack direction="column" spacing={3} justifyContent="center" alignItems="center" className="home-buttons">
            <Button
              className="login-btn animated-button"
              onClick={() => navigate("/login")}
              variant="contained"
              startIcon={<LockIcon />}
            >
            Log In
            </Button>
            <Button
              className="signup-btn animated-button"
              onClick={() => navigate("/signup")}
              variant="outlined"
              startIcon={<EditIcon />}
            >
              Sign Up
            </Button>
          </Stack>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
