import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  // In the bundled code, __dirname will be the dist folder
  // So we need to go to the 'public' subfolder
  const distPath = path.join(__dirname, "public");

  console.log(`[Static] Attempting to serve from: ${distPath}`);

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
    const indexPath = path.join(distPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error(`[Static] Failed to serve index.html:`, err.message);
        res.status(404).send("Application not found");
      }
    });
  });
}
