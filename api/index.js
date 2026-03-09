// Vercel Serverless Function Entry Point
// Using ES module syntax to work with package.json "type": "module"

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

export default function handler(req, res) {
    try {
        // Load the handler function from the built bundle
        const appPath = join(__dirname, '..', 'dist', 'index.cjs');
        const appModule = require(appPath);

        // The handler could be exported as default or as a named export
        const handlerFn = appModule.default || appModule;

        if (typeof handlerFn !== 'function') {
            console.error('Handler is not a function. Type:', typeof handlerFn);
            console.error('Available exports:', Object.keys(appModule));
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
}
