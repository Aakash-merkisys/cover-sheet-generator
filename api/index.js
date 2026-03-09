// Vercel Serverless Function Entry Point
// This file loads the Express app and exports it as a serverless handler

const path = require('path');
const fs = require('fs');

// Build the path to the compiled server bundle
const appPath = path.join(__dirname, '..', 'dist', 'index.cjs');

console.log('=== Vercel Serverless Function Starting ===');
console.log('Current directory:', __dirname);
console.log('App path:', appPath);
console.log('App exists:', fs.existsSync(appPath));

// Check what files exist in dist
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
    console.log('Files in dist:', fs.readdirSync(distDir));
    const publicDir = path.join(distDir, 'public');
    if (fs.existsSync(publicDir)) {
        console.log('Files in dist/public:', fs.readdirSync(publicDir).slice(0, 10));
    }
}

// Load the Express app
let app;
try {
    const appModule = require(appPath);
    app = appModule.default || appModule;

    if (!app || typeof app !== 'function') {
        console.error('Invalid app export. Type:', typeof app);
        console.error('Module keys:', Object.keys(appModule));
        throw new Error('Express app is not a valid function');
    }

    console.log('✓ Express app loaded successfully');
    console.log('App type:', typeof app);
} catch (error) {
    console.error('✗ Failed to load Express app:', error.message);
    console.error('Stack:', error.stack);
    throw error;
}

// Export the Express app directly as the serverless handler
// Vercel will call this function with (req, res) for each request
module.exports = app;
