import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouterVite } from "@tanstack/router-plugin";
import { tanstackStartVite } from "@tanstack/react-start/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackRouterVite(),
    tanstackStartVite({
      deployment: 'vercel'
    }),
    react(),
    tsconfigPaths(),
  ],
});
