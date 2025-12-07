require('dotenv').config();

const express = require('express');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// ----- Load OpenAPI spec -----
const openapiPath = path.join(__dirname, 'openapi.yaml');
const openapiDocument = YAML.load(openapiPath);

// ----- Landing page -----
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Patient Service API</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #e3f2fd, #fff);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        padding-top: 40px;
      }

      .card {
        background: #ffffff;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        width: 580px;
        animation: fadeIn 0.6s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      h1 {
        font-size: 28px;
        margin-bottom: 8px;
        color: #1a237e;
      }

      p.subtitle {
        font-size: 16px;
        color: #555;
        margin-bottom: 24px;
      }

      .section-title {
        font-size: 18px;
        margin-top: 24px;
        margin-bottom: 8px;
        font-weight: 600;
        color: #0d47a1;
      }

      a.button {
        display: inline-block;
        padding: 12px 20px;
        margin-top: 10px;
        background: #1976d2;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-size: 15px;
        transition: 0.2s ease;
      }

      a.button:hover {
        background: #0d47a1;
      }

      .version-box {
        background: #f5faff;
        padding: 12px 16px;
        border-radius: 10px;
        margin-top: 6px;
        border-left: 4px solid #64b5f6;
      }

      .code {
        background: #eee;
        padding: 10px;
        border-radius: 6px;
        font-family: monospace;
        margin-top: 10px;
        white-space: pre-wrap;
      }

      footer {
        text-align: center;
        margin-top: 20px;
        color: #777;
        font-size: 13px;
      }
    </style>
  </head>

  <body>
    <div class="card">
      <h1>💙 Patient Service API</h1>
      <p class="subtitle">OpenAPI-first design • Versioned APIs • JWT Authentication (v2)</p>

      <div class="section-title">📘 API Documentation</div>
      <a class="button" href="/docs" target="_blank">Open Swagger Docs</a>

      <div class="section-title">📄 API Specification (YAML)</div>
      <a class="button" href="/openapi.yaml" target="_blank">View openapi.yaml</a>

      <div class="section-title">🔐 Authentication</div>
      <div class="code">POST /auth/login  
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}</div>

      <div class="section-title">🔀 API Versions</div>
      
      <div class="version-box">
        <b>v1 — Public</b><br>
        GET /v1/patients<br>
        GET /v1/patients/{id}
      </div>

      <div class="version-box">
        <b>v2 — Secured (JWT)</b><br>
        GET /v2/patients<br>
        POST /v2/patients<br>
        GET /v2/patients/{id}
      </div>

      <footer>Demo built with Node.js + Express + OpenAPI + JWT</footer>
    </div>
  </body>
  </html>
  `);
});

// ----- Serve raw OpenAPI YAML -----
app.get('/openapi.yaml', (req, res) => {
  res.type('text/yaml');
  res.sendFile(openapiPath);
});

// ----- Swagger docs -----
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// ----- In-memory user store (login) -----
const users = [
  {
    id: "u1",
    username: "admin",
    // password = "password123"
    passwordHash: "$2b$10$2thZNuRVPsFOrDnmCVDhPeYiFcV25e6HZxxRkpBFq5l.Zm6Y76BJ6"
  }
];

// ----- /auth/login (PUBLIC) -----
app.post('/auth/login', (req, res) => {
    console.log('LOGIN raw body =', req.body);
  
    // Support both:
    // { "username": "admin", "password": "password123" }
    // and
    // { "login": { "username": "...", "password": "..." } }
    let username;
    let password;
  
    if (req.body && typeof req.body === 'object') {
      if (req.body.username || req.body.password) {
        username = req.body.username;
        password = req.body.password;
      } else if (req.body.login && typeof req.body.login === 'object') {
        username = req.body.login.username;
        password = req.body.login.password;
      }
    }
  
    console.log('LOGIN parsed username =', username, 'password =', password);
  
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }
  
    // Simple hard-coded demo check
    if (username !== 'admin' || password !== 'password123') {
      console.log('LOGIN invalid: expected admin/password123');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  
    const secret = process.env.API_JWT_SECRET;
    if (!secret) {
      console.error('API_JWT_SECRET is not set');
      return res.status(500).json({ error: 'Server auth misconfiguration' });
    }
  
    const token = jwt.sign(
      {
        sub: 'u1',
        username: 'admin',
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
  

// ----- In-memory patient data -----
let patients = [
  { id: '1', name: 'Alice Smith', birthDate: '1980-05-10', condition: 'Hypertension' },
  { id: '2', name: 'Bob Lee',   birthDate: '1975-09-22', condition: 'Diabetes' },
];

// ----- V1: PUBLIC ROUTES -----
app.get('/v1/patients', (req, res) => {
  res.json(patients);
});

app.get('/v1/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

// ----- JWT AUTH MIDDLEWARE -----
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring('Bearer '.length).trim();
  const secret = process.env.API_JWT_SECRET;

  console.log('VERIFY: using secret =', secret);
  console.log('VERIFY: token from header =', token);

  if (!secret) {
    console.error('API_JWT_SECRET is not set');
    return res.status(500).json({ error: 'Server auth misconfiguration' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    console.log('VERIFY: decoded payload =', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ----- V2: SECURED ROUTES -----
const v2Router = express.Router();

// All v2 routes require JWT
v2Router.use(authMiddleware);

v2Router.get('/patients', (req, res) => {
  console.log('v2 GET /patients user =', req.user);
  res.json(patients);
});

v2Router.post('/patients', (req, res) => {
  const { name, birthDate, condition } = req.body;
  if (!name || !birthDate) {
    return res.status(400).json({ error: 'name and birthDate are required' });
  }

  const newPatient = {
    id: String(patients.length + 1),
    name,
    birthDate,
    condition: condition || null,
  };

  patients.push(newPatient);
  res.status(201).json(newPatient);
});

v2Router.get('/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

// Mount v2 router at /v2
app.use('/v2', v2Router);

// ----- Start server -----

// Export the app for testing
module.exports = app;

// Start server only if NOT in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}