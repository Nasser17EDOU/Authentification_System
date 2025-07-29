import { Box, Container, Typography, useTheme } from "@mui/material";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed", // Keeps it fixed on the screen
        bottom: 0, // Sticks to the bottom
        left: 0, // Ensures full width
        right: 0, // Ensures full width
        width: "100%", // Full width
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        py: 3,
        zIndex: theme.zIndex.appBar - 1000, // Ensures it stays below AppBar (if needed)
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} {import.meta.env.VITE_APPFOOTER_TITLE}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
