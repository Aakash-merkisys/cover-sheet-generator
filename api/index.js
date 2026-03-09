// Vercel Serverless Function Entry Point
const path = require('path');

// Cache the app instance
let app = null;

module.exports = async (req, res) => {
    try {
        // Load app only once (cached after first invocation)
        if (!app) {
            const appPath = path.join(__dirname, '..', 'dist', 'index.cjs');
            const appModule = require(appPath);
            app = appModule.default || appModule;

            console.log('Express app loaded successfully');
        }

        // Handle the request
        return app(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);

        // Return detailed error for debugging
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
