// Vercel serverless function entry point
module.exports = (req, res) => {
    // Import the Express app from the built server
    const app = require('../dist/index.cjs').default || require('../dist/index.cjs');

    // Handle the request with Express
    return app(req, res);
};
