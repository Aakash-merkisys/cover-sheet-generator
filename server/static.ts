import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  // Use process.cwd() as base - it's always defined
  // In production, the built files are in dist/public relative to project root
  const distPath = path.resolve(process.cwd(), "dist", "public");

  console.log(`[Static] Working directory: ${process.cwd()}`);
  console.log(`[Static] Serving static files from: ${distPath}`);

  // Serve static files with proper caching headers
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    lastModified: true,
  }));

  // SPA fallback - serve index.html for all non-API routes
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }

    // Try to serve index.html for SPA routing
    const indexPath = path.resolve(distPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[Static] Failed to serve index.html:`, err.message);
        console.error(`[Static] Tried path: ${indexPath}`);
        res.status(404).send("Application not found");
      }
    });
  });
}
