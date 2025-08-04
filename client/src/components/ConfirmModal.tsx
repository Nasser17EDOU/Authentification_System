import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Fade,
  Typography,
  useMediaQuery,
  useTheme,
  type AlertColor,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import {
  ErrorOutline,
  WarningAmberOutlined,
  InfoOutlined,
  HelpOutline,
} from "@mui/icons-material";

type ConfirmModalProps = {
  open: boolean;
  onClose: (result: boolean) => void;
  severity?: AlertColor;
  title?: string;
  message: string | React.ReactNode;
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

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  severity = "warning",
  title = "Confirmation",
  message,
  confirmText = "Oui",
  cancelText = "Non",
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      TransitionComponent={Transition}
      // fullScreen={fullScreen}
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
          <Box>
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
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={() => onClose(false)}
          variant="outlined"
          color="inherit"
          // fullWidth
          sx={{ textTransform: "none", py: 1 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={() => onClose(true)}
          variant="contained"
          color={severity}
          // fullWidth
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

export default ConfirmModal;
