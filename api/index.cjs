// Vercel Serverless Function Entry Point
// This file loads and invokes the Express app handler

module.exports = (req, res) => {
    try {
        // Load the handler function from the built bundle
        const handler = require('../dist/index.cjs');

        // The handler could be exported as default or as a named export
        const handlerFn = handler.default || handler;

        if (typeof handlerFn !== 'function') {
            console.error('Handler is not a function. Type:', typeof handlerFn);
            console.error('Available exports:', Object.keys(handler));
            throw new Error('Invalid handler export');
        }

        // Invoke the handler
        return handlerFn(req, res);

    } catch (error) {
        console.error('Serverless function error:', error);
        console.error('Error stack:', error.stack);

        // Return error response if headers haven't been sent
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
};
