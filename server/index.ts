import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

// Extend Express Request type to include rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Logging utility
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Create Express app
const app = express();

// Body parsing middleware
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Initialize routes
registerRoutes(app);

// Serve static files (for SPA fallback)
// On Vercel, this serves the React app for non-API routes
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  serveStatic(app);
}

// Error handling middleware (must be after routes and static files)
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Internal Server Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(status).json({ message });
});

// Only start an HTTP server in local development, NOT on Vercel
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => {
    log(`Local server listening on port ${port}`);
  });
}

// Export the Express app for Vercel serverless
export default app;
