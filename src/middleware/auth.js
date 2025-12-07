// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring('Bearer '.length).trim();
  const secret = process.env.API_JWT_SECRET;

  if (!secret) {
    console.error('API_JWT_SECRET is not set');
    return res.status(500).json({ error: 'Server auth misconfiguration' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
