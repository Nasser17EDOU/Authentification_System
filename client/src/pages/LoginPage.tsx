import React, { useState } from "react";
import {
    Alert,
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const LoginPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    showPassword: false,
  });

  const handleChange =
    (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [prop]: event.target.value });
    };

  const handleClickShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
   
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={isMobile ? 1 : 3}
        sx={{
          width: "100%",
          p: 4,
          borderRadius: 2,
          backgroundColor: `rgb(${
            theme.palette.mode === "light" ? "255, 255,255" : "0,0,0"
          }, 0.6)`,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            Connectez-vous
          </Typography>

          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="login">Login</InputLabel>
            <OutlinedInput
              id="login"
              value={formData.login}
              onChange={handleChange("login")}
              label="Login"
              required
            />
          </FormControl>

          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="password">Mot de passe</InputLabel>
            <OutlinedInput
              id="password"
              type={formData.showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange("password")}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={`${
                      formData.showPassword ? "Cacher" : "Voir"
                    } le mot de passe`}
                  >
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {formData.showPassword ? (
                        <Visibility />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
              label="Mot de passe"
              required
            />
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: "1rem",
            }}
          >
            Se connecter
          </Button>

          {/* <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 2,
              color: "text.secondary",
            }}
          >
            Don't have an account?{" "}
            <Typography
              component="span"
              color="primary"
              sx={{
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Sign up
            </Typography>
          </Typography> */}
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
