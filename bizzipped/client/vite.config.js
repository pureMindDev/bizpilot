import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fallback for when VITE_API_URL isn't set (services/api.js defaults the
    // baseURL to '/api') — proxies straight to the local Express server so
    // `npm run dev` works out of the box alongside `npm run dev` in server/.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: "modern-compiler" },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'charts';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('react-router-dom') || id.includes('/react/') || id.includes('/react-dom/')) return 'vendor';
          }
        },
      },
    },
  },
});
