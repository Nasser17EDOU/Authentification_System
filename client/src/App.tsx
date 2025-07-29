import { Box, Toolbar } from "@mui/material";
import AppBar from "./components/AppBar";
import Footer from "./components/Footer";
import AppRoutes from "./components/AppRoutes";
import logo from "./assets/logo.png";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        // Ensure no overflow at the root level
        overflow: "hidden",
      }}
    >
      {/* Fixed AppBar at the top */}
      <AppBar />
      <Toolbar /> {/* This pushes content below the AppBar */}
      {/* Main content area with scroll */}
      <Box
        component="main"
        sx={{
          flex: 1, // Takes all available space
          overflowY: "auto",
          position: "relative", // Needed for pseudo-element positioning
          "&::before": {
            // This creates the semi-transparent overlay
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${logo})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.3, // Adjust this value (0.3 = 30% opacity)
            zIndex: -1,
          },
        }}
      >
        {true ? <LoginPage /> : true ? <></> : <AppRoutes />}
      </Box>
      <Toolbar />
      {/* Fixed Footer at the bottom */}
      <Footer />
    </Box>
  );
}
