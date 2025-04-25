import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ComplaintForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    try {
      const res = await fetch("http://localhost:5005/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setSubmitted(true);
      setMessage("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 6,
        px: 4,
        py: 6,
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Back Button */}
      <Button
        onClick={() => navigate(-1)} 
        sx={{
          position: "absolute",
          top: "20px",
          left: "20px",
          backgroundColor: "#1e3a8a",
          color: "#fff",
          borderRadius: "50%",
          padding: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            backgroundColor: "#3b82f6",
          },
        }}
      >
        <ArrowBackIcon />
      </Button>

      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontWeight: 700 }}>
        Register a Complaint
      </Typography>

      {submitted && <Alert severity="success" sx={{ mb: 2 }}>Complaint submitted successfully!</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Describe your issue"
          multiline
          rows={6}
          fullWidth
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            borderRadius: 2,
            backgroundColor: "#fff",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
            mb: 3,
            padding: 2,
            boxShadow: 1,
            transition: "box-shadow 0.3s ease",
            "&:focus-within": {
              boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
            },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              padding: "12px 24px",
              fontSize: "1rem",
              "&:hover": {
                backgroundColor: "#3b82f6",
              },
            }}
          >
            Submit Complaint
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderRadius: 2,
              padding: "12px 24px",
              borderColor: "#3b82f6",
              color: "#3b82f6",
              fontSize: "1rem",
              "&:hover": {
                borderColor: "#2563eb",
                backgroundColor: "#e0f2fe", 
              },
            }}
            onClick={() => navigate("/select-role")}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
}
