import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// ================= LOG SETUP =================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (!entries.length) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  const lines = entries.map(
    (entry) => `[${new Date().toISOString()}] ${JSON.stringify(entry)}`
  );

  fs.appendFileSync(logPath, lines.join("\n") + "\n");
}

// ================= DEBUG PLUGIN =================

function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") return html;

      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") return next();

        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);

            if (payload.consoleLogs) {
              writeToLogFile("browserConsole", payload.consoleLogs);
            }
            if (payload.networkRequests) {
              writeToLogFile("networkRequests", payload.networkRequests);
            }
            if (payload.sessionEvents) {
              writeToLogFile("sessionReplay", payload.sessionEvents);
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false }));
          }
        });
      });
    },
  };
}

// ================= MAIN CONFIG =================

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePluginManusRuntime(),
    vitePluginManusDebugCollector(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  envDir: path.resolve(import.meta.dirname),

  root: path.resolve(import.meta.dirname, "client"),

  publicDir: path.resolve(import.meta.dirname, "client", "public"),

  base: "/",

  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },

  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
  },
});