// src/components/navbar/Navbar.jsx
import React from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button, // Using Button instead of IconButton
  Stack   // Using Stack for button alignment
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Example icon

// Removed: import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = React.useMemo(() => !!localStorage.getItem("userId"), []);
  // Show settings button only on specific path(s) and if logged in
  const showSettings = location.pathname === "/select-role" && isLoggedIn;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary" elevation={0} /* Black AppBar, no shadow */ >
      <Toolbar>
        {/* Logo/Title */}
        <Typography
          variant="h6"
          component={RouterLink}
          to={isLoggedIn ? "/select-role" : "/"}
          sx={{
            color: 'inherit', // White text on black AppBar
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            flexGrow: 1, // Allow title to take available space pushing buttons right
          }}
        >
           <ShoppingCartIcon sx={{ mr: 1 }} />
          Campus Cart
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}> {/* Use Stack for horizontal layout and spacing */}
          {/* Show Settings Button conditionally */}
          {showSettings && (
            <Button
              color="inherit" // White text color
              component={RouterLink}
              to="/settings"
              // variant="text" // Use text variant for less emphasis if needed
              sx={{ textTransform: 'none' }} // Prevent uppercase text
            >
              Settings
            </Button>
          )}

          {/* Show Logout Button conditionally */}
          {isLoggedIn && (
             <Button
              color="inherit" // White text color
              onClick={handleLogout}
              // variant="text"
              sx={{ textTransform: 'none' }} // Prevent uppercase text
            >
              Logout
            </Button>
          )}

          {/* Show Login/Signup if NOT logged in (Optional Enhancement) */}
          {!isLoggedIn && (
             <>
                <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{ textTransform: 'none' }}
                 >
                    Log In
                </Button>
                 <Button
                    // Use outlined or text variant for secondary action on dark background
                    variant="outlined"
                    // sx prop for custom styling for contrast if needed
                    sx={{
                        color: 'inherit', // White text
                        borderColor: 'rgba(255, 255, 255, 0.5)', // Subtle white border
                         '&:hover': {
                             borderColor: 'white', // Brighter border on hover
                             bgcolor: 'rgba(255, 255, 255, 0.08)' // Subtle hover background
                         },
                         textTransform: 'none'
                     }}
                    component={RouterLink}
                    to="/signup"
                 >
                    Sign Up
                </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}