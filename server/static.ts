import express, { type Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  // In the bundled code, __dirname will be the dist folder
  // So we need to go to the 'public' subfolder
  // Ensure __dirname is defined (it should be in CommonJS bundle)
  const baseDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  const distPath = path.join(baseDir, "public");

  console.log(`[Static] Base directory: ${baseDir}`);
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
        console.error(`[Static] Tried path: ${indexPath}`);
        res.status(404).send("Application not found");
      }
    });
  });
}
