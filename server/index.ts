// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import "dotenv/config";

import { setupLocalAuth } from "./localAuth";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

/* 1) Body parsers first */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* 2) (Optional) API logger – before routes so it can see responses */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  (res as any).json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;
    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
    log(logLine);
  });

  next();
});

(async () => {
  try {
    /* 3) Auth FIRST (defines POST /api/login, session, passport, etc.) */
    await setupLocalAuth(app);

    /* 4) Then register the rest of your API routes */
    const server = await registerRoutes(app);

    /* 5) Error handler for API */
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      // console.error(err); // uncomment if you want full stack in console
    });

    /* 6) Guard: ensure ANY /api/* that falls through returns JSON (not index.html) */
    app.use("/api", (_req, res) => {
      res.status(404).json({ message: "API route not found" });
    });

    /* 7) Frontend LAST: Vite dev middleware (dev) or static assets (prod) */
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    /* 8) Listen */
    const port = Number(process.env.PORT ?? 5000);
    const host = process.env.HOST ?? "127.0.0.1"; // bind to localhost on Windows
    server.listen({ port, host }, () => {
      log(`serving on http://${host}:${port}`);
    });
  } catch (e) {
    console.error("Fatal startup error:", e);
    process.exit(1);
  }
})();
