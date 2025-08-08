import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline } from "@mui/material";
import { AppThemeProvider } from "./theme/theme";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryProvider } from "./providers/QueryClientProvider"; // Import your Query Provider

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <CssBaseline />
      <BrowserRouter>
        <ReactQueryProvider> {/* Add the Query Provider here */}
          <App />
        </ReactQueryProvider>
      </BrowserRouter>
    </AppThemeProvider>
  </React.StrictMode>
);