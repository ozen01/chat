import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";
import { createServer as createHttpServer } from "http";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
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
  let httpServer: any = null;

  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      const app = createServer();
      const sockServer = app._httpServer;

      // If we have an HTTP server from Socket.io setup, listen on a separate port
      if (sockServer) {
        sockServer.listen(3001, "::", () => {
          console.log("🔌 Backend server with Socket.io running on port 3001");
        });
        httpServer = sockServer;
      }

      // Add Express app as middleware for API routes
      return () => {
        server.middlewares.use(app);
      };
    },
  };
}
