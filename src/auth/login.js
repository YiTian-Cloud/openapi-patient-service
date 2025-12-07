// src/auth/login.js
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Simple hard-coded credentials for demo
const DEMO_USER = {
  id: 'u1',
  username: 'admin',
  password: 'password123', // in real life this would be hashed & stored
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('LOGIN raw body =', req.body);

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
    console.log('LOGIN invalid credentials');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const secret = process.env.API_JWT_SECRET;
  if (!secret) {
    console.error('API_JWT_SECRET is not set');
    return res.status(500).json({ error: 'Server auth misconfiguration' });
  }

  const token = jwt.sign(
    {
      sub: DEMO_USER.id,
      username: DEMO_USER.username,
      role: 'admin',
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  console.log('LOGIN: issued token =', token);

  res.json({
    message: 'Login successful',
    token,
  });
});

module.exports = router;
