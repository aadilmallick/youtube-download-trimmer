import { defineConfig, loadEnv, ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";

const env = loadEnv("development", "../", "");
console.log("SERVER_MODE", env.SERVER_MODE);
console.log("VITE_API_URL_DEV", env.VITE_API_URL_DEV);
console.log("VITE_API_URL_PRODUCTION", env.VITE_API_URL_PRODUCTION);

const target =
  env.SERVER_MODE === "development"
    ? env.VITE_API_URL_DEV
    : env.VITE_API_URL_PRODUCTION;

const obj = target
  ? {
      "/api": {
        changeOrigin: true,
        secure: false,
        target,
      },
    }
  : {};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../dist",
  },
  server: {
    proxy: {
      ...(obj as Record<string, string | ProxyOptions>),
    },
    host: true, // Listen on all addresses, including the container's network
    port: 5179, // Default Vite port
    watch: {
      usePolling: true, // Necessary for some container setups
    },
  },
});
