import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // Remove "VITE_" prefix filter
  return {
    base: "/",
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: parseInt(env.VITE_APP_PORT, 10),
    },
  };
});
