import * as React from "react";
import { useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material/styles";

// Import French locale for DataGrid
import { frFR } from "@mui/x-data-grid/locales";
import { frFR as coreFrFR } from "@mui/material/locale";

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
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
});

export const useSystemTheme = (): PaletteMode => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    noSsr: true,
  });
  return prefersDarkMode ? "dark" : "light";
};

export const createAppTheme = (mode: PaletteMode) => {
  const themeOptions = getDesignTokens(mode);
  const theme = createTheme(themeOptions, frFR, coreFrFR);

  // Add DataGrid localization after theme creation
  return createTheme(theme, {
    components: {
      MuiDataGrid: {
        defaultProps: {
          localeText: frFR.components.MuiDataGrid.defaultProps.localeText,
        },
      },
    },
  });
};

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const mode = useSystemTheme();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return React.createElement(ThemeProvider, { theme }, children);
};
