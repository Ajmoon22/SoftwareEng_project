// Example theme definition (place in theme.js or App.js)
import { createTheme } from '@mui/material/styles';

const strictBlackAndWhiteTheme = createTheme({
  palette: {
    mode: 'light', // Keep light mode base
    primary: {
      main: '#000000', // Black
      contrastText: '#ffffff', // White text
    },
    secondary: {
      main: '#ffffff', // White
      contrastText: '#000000', // Black text
    },
    background: {
      default: '#ffffff', // Pure White background
      paper: '#ffffff',   // Pure White for paper elements (removed off-white)
    },
    text: {
      primary: '#000000',   // Pure Black text
      secondary: '#000000', // Pure Black text (removed grey)
    },
    divider: 'rgba(0, 0, 0, 0.12)', // Keep divider subtle black/grey
    action: {
      active: '#000000',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#000000', // No background change on hover
            opacity: 0.9 // Slight opacity change for hover feedback
          }
        },
        outlinedPrimary: {
          color: '#000000',
          borderColor: '#000000',
          '&:hover': {
            backgroundColor: 'transparent', // No background change
            borderColor: '#000000',
             opacity: 0.8
          }
        },
         textPrimary: { // For text buttons if used
            color: '#000000',
             '&:hover': {
                 backgroundColor: 'transparent',
                 opacity: 0.8,
             }
        }
      }
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                 '& label': { // Default label color
                    color: '#000000',
                 },
                 '& label.Mui-focused': {
                    color: '#000000', // Keep focused label black
                },
                 '& .MuiOutlinedInput-root': {
                     '& fieldset': { // Default border
                         borderColor: 'rgba(0, 0, 0, 0.23)', // Standard subtle border
                     },
                     '&:hover fieldset': {
                         borderColor: '#000000', // Black border on hover
                     },
                    '&.Mui-focused fieldset': {
                        borderColor: '#000000', // Black border when focused
                        borderWidth: '1px', // Ensure border width consistency
                    },
                    // Ensure input text is black
                    '& input': {
                        color: '#000000',
                    }
                },
            }
        }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#000000', // Black links
          textDecoration: 'underline',
          textDecorationColor: '#000000', // Black underline
          '&:hover': {
            opacity: 0.8,
            textDecorationColor: '#000000',
          }
        }
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                // Ensure default paper background is white from palette
                backgroundColor: '#ffffff',
            }
        }
    },
    MuiAvatar: {
         styleOverrides: {
             root: {
                 backgroundColor: '#000000', // Black avatar background
                 color: '#ffffff', // White icon/text inside avatar
             }
         }
    },
    MuiIcon: { // Default icon color
        styleOverrides: {
            root: {
                color: '#000000'
            }
        }
    },
     MuiSvgIcon: { // Default SVG icon color (includes icons like LockOutlinedIcon)
        styleOverrides: {
            root: {
                color: '#000000'
            }
        }
    }
  }
});

export default strictBlackAndWhiteTheme;