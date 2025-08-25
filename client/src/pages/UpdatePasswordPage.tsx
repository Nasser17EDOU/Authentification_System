import React, { useMemo, useState } from "react";
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
import { sessionDataContext } from "../context/SessionContext";
import { passwordApi } from "../api/password.api";
import { infoDialog } from "../components/infoDialog";

const UpdatePasswordPage = () => {
  const theme = useTheme();
  const { sessionData, updateSessionData } = sessionDataContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    oldPass: "",
    newPass: "",
    confirmPass: "",
    showOldPass: false,
    showNewPass: false,
  });

  const [focusedField, setFocusedField] = useState<
    null | "oldPass" | "newPass" | "confirmPass"
  >(null);

  const newPassRequirements = useMemo(
    () => ({
      minLength: formData.newPass.trim().length >= 8,
      hasUppercase: /[A-Z]/.test(formData.newPass.trim()),
      hasLowercase: /[a-z]/.test(formData.newPass.trim()),
      hasDigitOrSpecialChar: /[\d\W_]/.test(formData.newPass.trim()),
      differentToOldPass: formData.newPass.trim() !== formData.oldPass.trim(),
    }),
    [formData.newPass, formData.oldPass]
  );

  const canEditNewPass = formData.oldPass.trim() !== "";

  const canEditConfirmPass =
    canEditNewPass &&
    newPassRequirements.minLength &&
    newPassRequirements.hasUppercase &&
    newPassRequirements.hasLowercase &&
    newPassRequirements.hasDigitOrSpecialChar &&
    newPassRequirements.differentToOldPass;

  const canSubmit =
    canEditConfirmPass &&
    formData.confirmPass.trim() === formData.newPass.trim();

  const handleChange =
    (prop: "oldPass" | "newPass" | "confirmPass") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [prop]: event.target.value });
    };

  const handleClickShowPass = (prop: "showOldPass" | "showNewPass") => {
    setFormData({ ...formData, [prop]: !formData[prop] });
  };

  // Login mutation using React Query
  const updatePassMutation = useMutation({
    mutationFn: async (credentials: { oldPass: string; pass: string }) => {
      // This will automatically update session via your BaseApi

      return await passwordApi(updateSessionData).updateUserPassApi({
        ...credentials,
        isUpdate: sessionData.authStatus === "Initialized password",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const oldPass = formData.oldPass.trim();
    const pass = formData.confirmPass.trim();

    if (!oldPass || !pass) {
      return await infoDialog({
        message: "Veuillez renseigner le formulaire correctement.",
        severity: "error",
      });
    }

    updatePassMutation.mutate({ oldPass, pass });
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
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            align="center"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            Mettez à jour votre mot de passe
          </Typography>

          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="password">Ancien mot de passe</InputLabel>
            <OutlinedInput
              id="oldPass"
              type={formData.showOldPass ? "text" : "password"}
              value={formData.oldPass}
              onChange={handleChange("oldPass")}
              onFocus={() => setFocusedField("oldPass")}
              onBlur={() => setFocusedField(null)}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={`${
                      formData.showOldPass ? "Cacher" : "Voir"
                    } le mot de passe`}
                  >
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPass("showOldPass")}
                      edge="end"
                    >
                      {formData.showOldPass ? (
                        <Visibility />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
              label="Ancien mot de passe"
              inputProps={{ maxLength: 100 }}
              required
            />
          </FormControl>

          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="password">Nouveau mot de passe</InputLabel>
            <OutlinedInput
              id="newPass"
              type={formData.showNewPass ? "text" : "password"}
              value={formData.newPass}
              onChange={handleChange("newPass")}
              onFocus={() => setFocusedField("newPass")}
              onBlur={() => setFocusedField(null)}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={`${
                      formData.showNewPass ? "Cacher" : "Voir"
                    } le mot de passe`}
                  >
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPass("showNewPass")}
                      edge="end"
                    >
                      {formData.showNewPass ? (
                        <Visibility />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
              label="Nouveau mot de passe"
              disabled={!canEditNewPass}
              inputProps={{ maxLength: 100 }}
              required
            />
            {focusedField === "newPass" && (
              <>
                <Typography
                  variant="caption"
                  component="ul"
                  sx={{
                    pl: 1,
                    mt: 1,
                    color: "text.secondary",
                    "& li": {
                      listStyleType: "none",
                      "&:before": { content: '"• "', color: "primary.main" },
                    },
                  }}
                >
                  {" "}
                  <li
                    style={{
                      color: newPassRequirements.differentToOldPass
                        ? "green"
                        : "red",
                    }}
                  >
                    Différent de l'ancien mot de passe
                  </li>
                  <li
                    style={{
                      color: newPassRequirements.minLength ? "green" : "red",
                    }}
                  >
                    Au moins 8 caractères
                  </li>
                  <li
                    style={{
                      color: newPassRequirements.hasUppercase ? "green" : "red",
                    }}
                  >
                    Au moins une majuscule
                  </li>
                  <li
                    style={{
                      color: newPassRequirements.hasLowercase ? "green" : "red",
                    }}
                  >
                    Au moins une minuscule
                  </li>
                  <li
                    style={{
                      color: newPassRequirements.hasDigitOrSpecialChar
                        ? "green"
                        : "red",
                    }}
                  >
                    Au moins un chiffre ou un caractère spécial
                  </li>
                </Typography>
              </>
            )}
          </FormControl>

          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="confirmPass">
              Confirmez le mot de passe
            </InputLabel>
            <OutlinedInput
              id="confirmPass"
              type="password"
              value={formData.confirmPass}
              onChange={handleChange("confirmPass")}
              onFocus={() => setFocusedField("confirmPass")}
              onBlur={() => setFocusedField(null)}
              label="Confirmez le mot de passe"
              disabled={!canEditConfirmPass}
              required
            />
            {!canSubmit && focusedField === "confirmPass" && (
              <Typography variant="caption" sx={{ color: "red", mt: 1 }}>
                Le mot de passe doit correspondre au nouveau mot de passe.
              </Typography>
            )}
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!canSubmit || updatePassMutation.isPending}
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
          >
            {updatePassMutation.isPending ? (
              <CircularProgress />
            ) : (
              "Mettre à jour"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UpdatePasswordPage;
