// api/index.js - Vercel serverless entry
const app = require('../index');

module.exports = (req, res) => {
    // Delegate all requests to the express app
    return app(rq, res);
};