import React from "react";
import { createRoot } from "react-dom/client";
import ConfirmModal from "./ConfirmModal";
import { CssBaseline } from "@mui/material";
import { AppThemeProvider } from "../theme/theme";

export function confirmDialog(options: {
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  severity?: "info" | "warning" | "error" | "success";
}): Promise<boolean> {
  const container = document.createElement("div");
  document.body.appendChild(container);

  return new Promise((resolve) => {
    const root = createRoot(container);

    const handleClose = (result: boolean) => {
      root.unmount();
      container.remove();
      resolve(result);
    };

    root.render(
      <AppThemeProvider>
        <CssBaseline />
        <ConfirmModal open onClose={handleClose} {...options} />
      </AppThemeProvider>
    );
  });
}
