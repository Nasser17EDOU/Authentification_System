import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline } from "@mui/material";
import { AppThemeProvider } from "./theme/theme";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryProvider } from "./providers/QueryClientProvider"; // Import your Query Provider
import { SessionProvider } from "./context/SessionContext";

// Date pickers
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// If you use v2 of date-fns instead, import AdapterDateFnsV2

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <SessionProvider>
          <BrowserRouter>
            <ReactQueryProvider>
              <App />
            </ReactQueryProvider>
          </BrowserRouter>
        </SessionProvider>
      </LocalizationProvider>
    </AppThemeProvider>
  </React.StrictMode>
);
