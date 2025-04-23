import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, Link, Alert } from "@mui/material";
import bikeImage from "../../assets/bike_Rider.png"; // Correct image import
import "./LoginPage.css"; // Importing the CSS for styling

// --- Login Page Component ---
function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error on input change
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      const res = await fetch("http://localhost:5005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Login failed. Please check your credentials.");
      }

      // Store user info if login is successful
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("username", data.user.username);

      navigate("/select-role");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Left Section: Image and Text */}
        <div className="left-section">
          <img src={bikeImage} alt="Bike Delivery" className="bike-image" />
          <Typography variant="h4" className="main-text">
            Create Your CampusCart Account
          </Typography>
          <Typography variant="body1" className="info-text">
            Join the campus delivery movement!
            <br />
            Sign up to start receiving or delivering anything across your university.
          </Typography>
        </div>

        {/* Right Section: Login Form */}
        <Paper elevation={3} className="login-form">
          <Typography component="h1" variant="h5" className="form-title">
            Welcome Back!
          </Typography>
          <Typography component="p" variant="body1" className="form-description">
            Log in to continue using Campus Cart
          </Typography>

          {/* Display error message */}
          {error && (
            <Alert severity="error" className="error-message">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} className="login-form-box">
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={form.email}
              onChange={handleChange}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              error={!!error}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" className="signup-link">
                Don’t have an account?{' '}
                <Link component={RouterLink} to="/signup" variant="body2">
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </div>
    </div>
  );
}

export default LoginPage;
