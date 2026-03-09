// Vercel Serverless Function Entry Point
// This file acts as the adapter between Vercel's serverless environment and our Express app

// Import the built Express app
const appModule = require('../dist/index.cjs');
const app = appModule.default || appModule;

// Verify app loaded correctly
if (!app || typeof app !== 'function') {
    console.error('Failed to load Express app from dist/index.cjs');
    console.error('App module:', appModule);
    throw new Error('Express app not found or invalid');
}

console.log('✓ Express app loaded successfully for Vercel serverless');

// Export the Express app as the serverless function handler
// Vercel will call this function for each request
module.exports = app;
