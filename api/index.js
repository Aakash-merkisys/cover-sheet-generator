// Vercel Serverless Function Entry Point
const path = require('path');

// Load the Express app from the built bundle
const appPath = path.join(__dirname, '..', 'dist', 'index.cjs');
let app;

try {
    const appModule = require(appPath);
    app = appModule.default || appModule;

    if (!app || typeof app !== 'function') {
        throw new Error('Express app is not a function');
    }

    console.log('✓ Express app loaded successfully');
} catch (error) {
    console.error('Failed to load Express app:', error.message);
    console.error('Attempted path:', appPath);
    throw error;
}

// Export the Express app as the serverless handler
module.exports = app;
