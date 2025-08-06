import {
  Box,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AppBar from "./components/AppBar";
import Footer from "./components/Footer";
import AppRoutes from "./components/AppRoutes";
import logo from "./assets/logo.png";
import LoginPage from "./pages/LoginPage";
import { useEffect, useRef, useState } from "react";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import { getAllMenuObjects } from "./utilities/linksAndPermissions.utilities";

export default function App() {
  const appBarRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [appBarFooterHeight, setAppBarFooterHeight] = useState<{
    appBarHeight: number;
    footerHeight: number;
  }>({
    appBarHeight: 0,
    footerHeight: 0,
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const currentLinkObj = getAllMenuObjects
    .flatMap((menu) => menu.linkObjList)
    .find((linkObj) => linkObj.link === window.location.pathname);

  useEffect(() => {
    if (appBarRef.current) {
      const rect = appBarRef.current.getBoundingClientRect();
      setAppBarFooterHeight({
        ...appBarFooterHeight,
        appBarHeight: rect.height,
      });
    }
    if (footerRef.current) {
      const rect = footerRef.current.getBoundingClientRect();
      setAppBarFooterHeight({
        ...appBarFooterHeight,
        footerHeight: rect.height,
      });
    }
  }, []);

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
      <AppBar ref={appBarRef} />
      <Toolbar sx={{ height: appBarFooterHeight.appBarHeight }} />

      {currentLinkObj && (
        <>
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            fontWeight={700}
            sx={{ bgcolor: theme.palette.text.secondary, p: isSmallScreen ? 1 : 2 }}
          >
            {currentLinkObj.linkLabel}
          </Typography>
        </>
      )}

      {/* This pushes content below the AppBar */}
      {/* Main content area with scroll */}
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
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
        {false ? <LoginPage /> : false ? <UpdatePasswordPage /> : <AppRoutes />}
      </Box>
      <Toolbar sx={{ height: appBarFooterHeight.footerHeight }} />
      {/* Fixed Footer at the bottom */}
      <Footer ref={footerRef} />
    </Box>
  );
}
