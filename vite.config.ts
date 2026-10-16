import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The relative base path lets the built site work on GitHub Pages
// no matter what the repository is called.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
