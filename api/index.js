// Vercel serverless function entry point
module.exports = async (req, res) => {
    try {
        // Import the handler from the built server
        const handler = require('../dist/index.cjs').default;

        // Call the handler
        return await handler(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};
