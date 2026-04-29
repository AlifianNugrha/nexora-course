import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouterVite } from "@tanstack/router-plugin";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackRouterVite(),
    react(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist",
  }
});
