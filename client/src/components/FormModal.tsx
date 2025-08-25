import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Fade,
  Typography,
  TextField,
  useMediaQuery,
  useTheme,
  type AlertColor,
  MenuItem,
  Switch,
  InputAdornment,
  IconButton,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import {
  ErrorOutline,
  WarningAmberOutlined,
  InfoOutlined,
  HelpOutline,
  VisibilityOff,
  Visibility,
} from "@mui/icons-material";

export type FormField = {
  type:
    | "text"
    | "password"
    | "number"
    | "email"
    | "select"
    | "textarea"
    | "boolean";
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: (value: any) => string | null;
};

type FormDialogProps = {
  open: boolean;
  onClose: (result: Record<string, any> | null) => void;
  severity?: AlertColor;
  title?: string;
  fields: FormField[];
  confirmText?: string;
  cancelText?: string;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Fade in ref={ref} {...props} timeout={200} />;
});

const SeverityIcon = ({ severity }: { severity: AlertColor }) => {
  const iconProps = { fontSize: "large" as const, sx: { opacity: 0.9 } };
  switch (severity) {
    case "error":
      return <ErrorOutline color="error" {...iconProps} />;
    case "warning":
      return <WarningAmberOutlined color="warning" {...iconProps} />;
    case "info":
      return <InfoOutlined color="info" {...iconProps} />;
    default:
      return <HelpOutline color="primary" {...iconProps} />;
  }
};

const FormModal: React.FC<FormDialogProps> = ({
  open,
  onClose,
  severity = "info",
  title = "Form",
  fields,
  confirmText = "Submit",
  cancelText = "Cancel",
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [formValues, setFormValues] = useState<Record<string, any>>(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.defaultValue || "",
      }),
      {}
    )
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formValues[field.name];

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      if (field.validation) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onClose(formValues);
    }
  };

  const handleClose = () => {
    onClose(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[6],
          minWidth: fullScreen ? "95%" : 400,
          maxWidth: "95vw",
          overflow: "hidden",
          backgroundImage: "none",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            bgcolor:
              theme.palette.mode === "light"
                ? theme.palette.background.paper
                : theme.palette.grey[900],
          }}
        >
          <SeverityIcon severity={severity} />
          <Box sx={{ width: "100%" }}>
            {title && (
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                color={`${severity}.main`}
              >
                {title}
              </Typography>
            )}

            <Box
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              {fields.map((field) => {
                if (field.type === "boolean") {
                  return (
                    <Box
                      key={field.name}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography sx={{ mr: 2 }}>{field.label}</Typography>
                      <Switch
                        checked={Boolean(formValues[field.name])}
                        onChange={(e) =>
                          handleInputChange(field.name, e.target.checked)
                        }
                        inputProps={{ "aria-label": field.label }}
                      />
                    </Box>
                  );
                }

                const [showPassword, setShowPassword] = useState(false); // 👈 inside FormModal

                return (
                  <TextField
                    key={field.name}
                    fullWidth
                    type={
                      field.type === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : field.type === "textarea"
                        ? "text"
                        : field.type
                    }
                    label={field.label}
                    name={field.name}
                    value={formValues[field.name] ?? ""}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    required={field.required}
                    placeholder={field.placeholder}
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                    multiline={field.type === "textarea"}
                    rows={field.type === "textarea" ? 4 : undefined}
                    select={field.type === "select"}
                    InputProps={
                      field.type === "password"
                        ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    setShowPassword((prev) => !prev)
                                  }
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }
                        : undefined
                    }
                  >
                    {field.type === "select" &&
                      field.options?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                  </TextField>
                );
              })}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          sx={{ textTransform: "none", py: 1 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={severity}
          sx={{
            textTransform: "none",
            py: 1,
            fontWeight: 600,
            backgroundColor: `${severity}.main`,
            "&:hover": {
              backgroundColor: `${severity}.dark`,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormModal;
