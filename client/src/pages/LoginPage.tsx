import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
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
import { useMutation } from "@tanstack/react-query";
import { infoDialog } from "../components/infoDialog";
import { sessionDataContext } from "../context/SessionContext";
import { userApi } from "../api/user.api";

const LoginPage = () => {
  const theme = useTheme();
  const userApiList = userApi(sessionDataContext().updateSessionData);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    login: "",
    pass: "",
    showPassword: false,
  });

  const handleChange =
    (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [prop]: event.target.value });
    };

  const handleClickShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  // Login mutation using React Query
  const loginMutation = useMutation({
    mutationFn: async (credentials: { login: string; pass: string }) => {
      // This will automatically update session via your BaseApi
      return await userApiList.authUserApi(credentials);
    },
    onSuccess: async (data) => {
      if (data) {
        await userApiList.getUserSessionApi();
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const login = formData.login.trim();
    const pass = formData.pass.trim();

    if (!login || !pass) {
      return await infoDialog({
        message: "Veuillez renseigner le formulaire correctement.",
        severity: "error",
      });
    }

    loginMutation.mutate({ login, pass });
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        flex: 1,
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
              inputProps={{ maxLength: 20 }}
            />
          </FormControl>

          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="password">Mot de passe</InputLabel>
            <OutlinedInput
              id="password"
              type={formData.showPassword ? "text" : "password"}
              value={formData.pass}
              onChange={handleChange("pass")}
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
              inputProps={{ maxLength: 100 }}
              required
            />
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loginMutation.isPending}
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: "1rem",
            }}
          >
            {loginMutation.isPending ? <CircularProgress /> : "Se connecter"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
