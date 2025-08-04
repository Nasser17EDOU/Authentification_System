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
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

type InfoModalProps = {
  open: boolean;
  onClose: () => void;
  severity?: AlertColor;
  title?: string;
  message: string | React.ReactNode;
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
    case "success":
      return <CheckCircleOutline color="success" {...iconProps} />;
    default:
      return <InfoOutlined color="info" {...iconProps} />;
  }
};

const InfoModal: React.FC<InfoModalProps> = ({
  open,
  onClose,
  severity = "info",
  title,
  message,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          variant="contained"
          onClick={onClose}
          size="medium"
          fullWidth
          sx={{
            fontWeight: 600,
            textTransform: "none",
            py: 1,
            borderRadius: 1,
            backgroundColor: `${severity}.main`,
            "&:hover": {
              backgroundColor: `${severity}.dark`,
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoModal;
