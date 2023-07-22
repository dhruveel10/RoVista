// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Set the mode to 'dark' for a dark theme
    primary: {
      main: '#fff', // Replace with your primary color
    },
    secondary: {
      main: '#000', // Replace with your secondary color
    },
  },
});

export default theme;
