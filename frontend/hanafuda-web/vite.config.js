import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // ← Import from SWC
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      },
      manifest: {
        name: "Hanafuda Online",
        short_name: "Hanafuda",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/cards/8-hikari.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/cards/8-hikari.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  base: "/",
  build: {
    outDir: "dist",
  },
});
