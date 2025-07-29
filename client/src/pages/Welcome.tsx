import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

const Welcome: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 128px)",
        p: 2,
        textAlign: "center",
      }}
    >
      <Typography
        variant={isSmallScreen ? "h3" : isMediumScreen ? "h2" : "h1"}
        component="h1"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: theme.palette.getContrastText(
            theme.palette.background.default
          ),
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          maxWidth: "90%",
          [theme.breakpoints.down("sm")]: {
            fontSize: "2rem",
          },
        }}
      >
        {import.meta.env.VITE_APPWELCOME_TITLE}
      </Typography>

      <Typography
        variant={isSmallScreen ? "body1" : "h6"}
        sx={{
          color: theme.palette.getContrastText(
            theme.palette.background.default
          ),
          mt: 2,
          maxWidth: "80%",
          // [theme.breakpoints.down("sm")]: {
          //   display: "none",
          // },
        }}
      >
        {import.meta.env.VITE_APPWELCOMEPARAGRAPHE_TITLE}
      </Typography>
    </Box>
  );
};

export default Welcome;
