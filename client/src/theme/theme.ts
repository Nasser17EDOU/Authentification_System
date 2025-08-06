// theme.tsx
import * as React from "react"; // JSX
import { useMemo } from "react";
import { useMediaQuery } from "@mui/material";

import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles"; // VALUE import

import type { PaletteMode } from "@mui/material/styles"; // TYPE import
import { frFR } from "@mui/x-data-grid/locales";
import { frFR as coreFrFR } from "@mui/material/locale";

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: { main: "#1976d2" },
          background: { default: "#f5f5f5", paper: "#ffffff" },
        }
      : {
          primary: { main: "#90caf9" },
          background: { default: "#121212", paper: "#1e1e1e" },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  frFR,
  coreFrFR,
});

export const useSystemTheme = (): PaletteMode => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    noSsr: true,
  });
  return prefersDarkMode ? "dark" : "light";
};

export const createAppTheme = (mode: PaletteMode) =>
  createTheme(getDesignTokens(mode));

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const mode = useSystemTheme();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return React.createElement(ThemeProvider, { theme }, children);
};
