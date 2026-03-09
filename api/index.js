// Vercel Serverless Function Entry Point
// CommonJS is required here to load the .cjs bundle

const path = require('path');

// Load the Express app from the built bundle
const appPath = path.join(__dirname, '..', 'dist', 'index.cjs');
const appModule = require(appPath);
const app = appModule.default || appModule;

// Verify the app loaded correctly
if (!app || typeof app !== 'function') {
    console.error('Failed to load Express app');
    console.error('Module path:', appPath);
    console.error('Module exports:', Object.keys(appModule));
    throw new Error('Express app not found or invalid');
}

console.log('✓ Express app loaded for Vercel');

// Export as the handler
module.exports = app;
