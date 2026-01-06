import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    proxy: {
      "/socket.io": {
        target: "ws://localhost:3001",
        ws: true,
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      // Start the backend server on port 3001 for Socket.io and API
      const { createServer: createHttpServer } = await import("http");
      const app = createServer();
      const httpServer = app._httpServer || createHttpServer(app);

      httpServer.listen(3001, "::", () => {
        console.log("🔌 Backend server with Socket.io running on port 3001");
      });

      return () => {
        // Add Express middleware for other routes
        server.middlewares.use(app);
      };
    },
  };
}
