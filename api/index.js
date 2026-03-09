// Vercel serverless function entry point
const path = require('path');

// Import the built server
const serverPath = path.join(__dirname, '..', 'dist', 'index.cjs');

module.exports = require(serverPath);
