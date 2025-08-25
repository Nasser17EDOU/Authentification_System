import React from "react";
import { createRoot } from "react-dom/client";
import InfoModal from "./InfoModal";
import { CssBaseline } from "@mui/material";
import { AppThemeProvider } from "../theme/theme";

export function infoDialog(options: {
  title?: string;
  message: string | React.ReactNode;
  severity?: "info" | "warning" | "error" | "success";
}): Promise<void> {
  const container = document.createElement("div");
  document.body.appendChild(container);

  return new Promise((resolve) => {
    const root = createRoot(container);

    const handleClose = () => {
      root.unmount();
      container.remove();
      resolve();
    };

    root.render(
      <AppThemeProvider>
        <CssBaseline />
        <InfoModal open onClose={handleClose} {...options} />
      </AppThemeProvider>
    );
  });
}