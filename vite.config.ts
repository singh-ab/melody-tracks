import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5001,
    cors: true, // Enable CORS for all origins
  },
  // In production, we want to use '/' as the base path
  base: process.env.NODE_ENV === "production" ? "/" : "http://localhost:5001",
  plugins: [
    react(),
    federation({
      name: "music_library",
      filename: "remoteEntry.js",
      exposes: {
        "./MusicLibrary": "./src/components/MusicLibrary.tsx",
      },
      shared: {
        react: {
          singleton: true,
        },
        "react-dom": {
          singleton: true,
        },
      },
    }),
  ],
  build: {
    target: "chrome89",
    modulePreload: false,
    minify: false,
    cssCodeSplit: false,
  },
});
