// src/app.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const v1Router = require('./routes/v1');
const v2Router = require('./routes/v2');
const authRouter = require('./auth/login');

const app = express();

// Parse JSON bodies
app.use(express.json());

// ----- Load OpenAPI spec -----
const openapiPath = path.join(__dirname, '..', 'openapi.yaml');
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
      <p class="subtitle">OpenAPI-first • Versioned APIs • JWT-secured v2</p>

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

      <footer>Demo: Node.js + Express + OpenAPI + JWT</footer>
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

// ----- Auth + API routes -----
app.use('/auth', authRouter);  // POST /auth/login
app.use('/v1', v1Router);      // public v1
app.use('/v2', v2Router);      // JWT-protected v2

module.exports = app;
