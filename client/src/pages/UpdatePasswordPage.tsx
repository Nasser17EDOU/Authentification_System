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
  type AlertColor,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import InfoModal from "../components/InfoModal";
import { confirmDialog } from "../components/confirmDialog";

const UpdatePasswordPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    showOldPassword: false,
    showNewPassword: false,
  });

  const [focusedField, setFocusedField] = useState<
    null | "oldPassword" | "newPassword" | "confirmPassword"
  >(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoModalProps, setInfoModalProps] = useState({
    open: false,
    severity: "info" as AlertColor,
    title: "Mise à jour du mot de passe" as string | undefined,
    message: "",
  });

  const newPasswordRequirements = useMemo(
    () => ({
      minLength: formData.newPassword.trim().length >= 8,
      hasUppercase: /[A-Z]/.test(formData.newPassword.trim()),
      hasLowercase: /[a-z]/.test(formData.newPassword.trim()),
      hasDigitOrSpecialChar: /[\d\W_]/.test(formData.newPassword.trim()),
      differentToOldPassword:
        formData.newPassword.trim() !== formData.oldPassword.trim(),
    }),
    [formData.newPassword, formData.oldPassword]
  );

  const canEditNewPassword = formData.oldPassword.trim() !== "";

  const canEditConfirmPassword =
    canEditNewPassword &&
    newPasswordRequirements.minLength &&
    newPasswordRequirements.hasUppercase &&
    newPasswordRequirements.hasLowercase &&
    newPasswordRequirements.hasDigitOrSpecialChar &&
    newPasswordRequirements.differentToOldPassword;

  const canSubmit =
    canEditConfirmPassword &&
    formData.confirmPassword.trim() === formData.newPassword.trim();

  const handleChange =
    (prop: "oldPassword" | "newPassword" | "confirmPassword") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [prop]: event.target.value });
    };

  const handleClickShowPassword = (
    prop: "showOldPassword" | "showNewPassword"
  ) => {
    setFormData({ ...formData, [prop]: !formData[prop] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const confirmation = await confirmDialog({
      title: "Confirmer la mise à jour",
      message: "Êtes-vous sûr de vouloir mettre à jour votre mot de passe ?",
      confirmText: "Ouir",
      cancelText: "Non",
      severity: "info",
    });
    if (!confirmation) {
      setIsSubmitting(false);
      return;
    }
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // throw new Error("Simulated error"); // Simulate an error for demonstration
      setInfoModalProps({
        ...infoModalProps,
        severity: "success",
        message: "Mot de passe mis à jour avec succès!",
        open: true,
      });
      // Reset form or redirect
    } catch (error) {
      setInfoModalProps({
        ...infoModalProps,
        severity: "error",
        message: "Échec de la mise à jour du mot de passe. Veuillez réessayer.",
        open: true,
      });
    } finally {
      setIsSubmitting(false);
    }
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
              id="oldPassword"
              type={formData.showOldPassword ? "text" : "password"}
              value={formData.oldPassword}
              onChange={handleChange("oldPassword")}
              onFocus={() => setFocusedField("oldPassword")}
              onBlur={() => setFocusedField(null)}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={`${
                      formData.showOldPassword ? "Cacher" : "Voir"
                    } le mot de passe`}
                  >
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPassword("showOldPassword")}
                      edge="end"
                    >
                      {formData.showOldPassword ? (
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
              id="newPassword"
              type={formData.showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange("newPassword")}
              onFocus={() => setFocusedField("newPassword")}
              onBlur={() => setFocusedField(null)}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={`${
                      formData.showNewPassword ? "Cacher" : "Voir"
                    } le mot de passe`}
                  >
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPassword("showNewPassword")}
                      edge="end"
                    >
                      {formData.showNewPassword ? (
                        <Visibility />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
              label="Nouveau mot de passe"
              disabled={!canEditNewPassword}
              inputProps={{ maxLength: 100 }}
              required
            />
            {focusedField === "newPassword" && (
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
                      color: newPasswordRequirements.differentToOldPassword
                        ? "green"
                        : "red",
                    }}
                  >
                    Différent de l'ancien mot de passe
                  </li>
                  <li
                    style={{
                      color: newPasswordRequirements.minLength
                        ? "green"
                        : "red",
                    }}
                  >
                    Au moins 8 caractères
                  </li>
                  <li
                    style={{
                      color: newPasswordRequirements.hasUppercase
                        ? "green"
                        : "red",
                    }}
                  >
                    Au moins une majuscule
                  </li>
                  <li
                    style={{
                      color: newPasswordRequirements.hasLowercase
                        ? "green"
                        : "red",
                    }}
                  >
                    Au moins une minuscule
                  </li>
                  <li
                    style={{
                      color: newPasswordRequirements.hasDigitOrSpecialChar
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
            <InputLabel htmlFor="confirmPassword">
              Confirmez le mot de passe
            </InputLabel>
            <OutlinedInput
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              label="Confirmez le mot de passe"
              disabled={!canEditConfirmPassword}
              required
            />
            {!canSubmit && focusedField === "confirmPassword" && (
              <Typography variant="caption" sx={{ color: "red", mt: 1 }}>
                Le mot de passe doit correspondre au nouveau mot de passe.
              </Typography>
            )}
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!canSubmit || isSubmitting}
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Mettre à jour"
            )}
          </Button>
        </Box>
      </Paper>
      <InfoModal
        open={infoModalProps.open}
        onClose={() => setInfoModalProps({ ...infoModalProps, open: false })}
        severity={infoModalProps.severity}
        title={infoModalProps.title}
        message={infoModalProps.message}
      />
    </Container>
  );
};

export default UpdatePasswordPage;
