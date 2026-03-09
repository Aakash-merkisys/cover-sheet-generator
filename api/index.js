// Vercel Serverless Function Entry Point
const path = require('path');

// Cache the app instance
let cachedApp = null;

function loadApp() {
    if (cachedApp) {
        return cachedApp;
    }

    try {
        // Try multiple possible paths
        const possiblePaths = [
            path.join(__dirname, '..', 'dist', 'index.cjs'),
            path.join(process.cwd(), 'dist', 'index.cjs'),
            '../dist/index.cjs',
            './dist/index.cjs'
        ];

        let appModule = null;
        let successPath = null;

        for (const appPath of possiblePaths) {
            try {
                console.log('Trying to load from:', appPath);
                appModule = require(appPath);
                successPath = appPath;
                console.log('✓ Successfully loaded from:', appPath);
                break;
            } catch (err) {
                console.log('✗ Failed to load from:', appPath, '-', err.message);
            }
        }

        if (!appModule) {
            throw new Error('Could not load Express app from any path');
        }

        const app = appModule.default || appModule;

        if (!app || typeof app !== 'function') {
            throw new Error(`Invalid app export from ${successPath}. Type: ${typeof app}`);
        }

        cachedApp = app;
        console.log('✓ Express app cached successfully');
        return app;

    } catch (error) {
        console.error('Fatal error loading Express app:', error);
        throw error;
    }
}

module.exports = (req, res) => {
    try {
        const app = loadApp();
        app(req, res);
    } catch (error) {
        console.error('Request handler error:', error);

        if (!res.headersSent) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
};
