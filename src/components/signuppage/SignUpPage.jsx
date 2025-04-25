import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, Link, Alert } from "@mui/material";
import bikeImage from "../../assets/bike_Rider.png";
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", phone: "" }); // ✅ Add phone
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.username || !form.email || !form.password || !form.phone) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5005/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Signup failed. Please try again.");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="left-section">
          <img src={bikeImage} alt="Bike Delivery" className="bike-image" />
          <Typography variant="h4" className="main-text">
            Create Your CampusCart Account
          </Typography>
          <Typography variant="body1" className="info-text">
            Join the campus delivery movement!
            <br />
            Sign up to start receiving or delivering anything across your university—from the main gate to your favorite cafeteria to your dorm.
            <br /><br />
            <ul>
              <li>✔ Easy sign-up</li>
              <li>✔ Secure student-only access</li>
              <li>✔ Be a customer or a runner—your choice!</li>
            </ul>
          </Typography>
        </div>

        <Paper elevation={3} className="signup-form">
          <Typography component="h1" variant="h5" className="form-title">
            Create an Account
          </Typography>
          <Typography component="p" variant="body1" className="form-description">
            Join Campus Cart today!
          </Typography>

          {error && (
            <Alert severity="error" className="error-message">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="signup-form-box">
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Full Name"
              name="username"
              autoComplete="name"
              autoFocus
              value={form.username}
              onChange={handleChange}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              error={!!error}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Phone Number"
              type="tel"
              id="phone"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              error={!!error}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="signup-btn"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" className="signup-link">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Log in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </div>
    </div>
  );
}

export default SignUpPage;
