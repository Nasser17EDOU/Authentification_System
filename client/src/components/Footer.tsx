// src/components/Footer.tsx
import { Box, Container, Typography, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        py: 3,
        mt: 'auto' // Pour pousser le footer en bas dans une mise en page flex
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Mon Application. Tous droits réservés.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;