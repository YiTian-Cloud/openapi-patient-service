// src/app.js
require('dotenv').config();

const client = require('prom-client');

const express = require('express');

const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const path = require('path');


const v1Router = require('./routes/v1');
const v2Router = require('./routes/v2');
const authRouter = require('./auth/login');
//const YAML = require('yamljs');
//const swaggerUi = require('swagger-ui-express');

const app = express();

// Parse JSON bodies
app.use(express.json());



// Attach a correlation ID to every request for tracing across logs
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.id = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });


  // HTTP request logging (includes requestId for correlation)
morgan.token('id', (req) => req.id);

app.use(
  morgan(
    ':id :remote-addr :method :url :status :res[content-length] - :response-time ms'
  )
);

// ---- Prometheus metrics setup ---
client.collectDefaultMetrics();

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [50, 100, 300, 500, 1000, 2000] //ms
})

// ---- Simple in-memory observability state (demo only) ----
const recentRequests = [];
let totalRequests = 0;
let totalErrors = 0;
let totalLatencyMs = 0;


// Metrics middleware to measure each request
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;

    
        //use the route path if available, else fallback
        const route = req.route?.path || req.originalUrl || req.url;
        
        httpRequestDuration
            .labels(req.method, route, res.statusCode)
            .observe(duration);
    


     // ---- In-memory summary metrics ----
     totalRequests += 1;
     totalLatencyMs += duration;
     if (res.statusCode >= 500) {
       totalErrors += 1;
     }
 
     recentRequests.push({
       id: req.id,
       method: req.method,
       route,
       status: res.statusCode,
       durationMs: duration,
       time: new Date().toISOString(),
     });
 
     // keep only the last 20 entries
     if (recentRequests.length > 20) {
       recentRequests.shift();
     }
   });
 
    next();

});

// Expose /metrics for Prometheus scraping
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());

    } catch (err) {
        console.error('Error generating metrics:', err);
        res.status(500).send('Error generating metrics');
    }
});




// Health endpoint
app.get('/health', (req, res) => {
    res.json({status: 'ok', uptime: process.uptime()});
});



// ----- Load OpenAPI spec -----
const openapiPath = path.join(__dirname, '..', 'openapi.yaml');
//const openapiDocument = YAML.load(openapiPath);

app.get('/observability-summary', (req, res) => {
    const avgLatency = totalRequests ? totalLatencyMs / totalRequests : 0;
  
    res.json({
      totalRequests,
      totalErrors,
      avgLatencyMs: Number(avgLatency.toFixed(1)),
      recentRequests,
    });
  });
  
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
        <p class="subtitle">OpenAPI-first • Versioned APIs • JWT-secured v2 • Observability</p>
  
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
  
        <div class="section-title">📊 Observability (demo)</div>
        <div id="obs-cards" style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
          <div style="flex:1; min-width:150px; background:#f5faff; border-radius:10px; padding:10px;">
            <div style="font-size:12px; text-transform:uppercase; color:#666;">Total Requests</div>
            <div id="obs-total" style="font-size:20px; font-weight:600;">–</div>
          </div>
          <div style="flex:1; min-width:150px; background:#fff3e0; border-radius:10px; padding:10px;">
            <div style="font-size:12px; text-transform:uppercase; color:#666;">Errors (5xx)</div>
            <div id="obs-errors" style="font-size:20px; font-weight:600;">–</div>
          </div>
          <div style="flex:1; min-width:150px; background:#e8f5e9; border-radius:10px; padding:10px;">
            <div style="font-size:12px; text-transform:uppercase; color:#666;">Avg Latency (ms)</div>
            <div id="obs-latency" style="font-size:20px; font-weight:600;">–</div>
          </div>
        </div>
  
        <div style="max-height:180px; overflow:auto; border-radius:8px; border:1px solid #e0e0e0; background:#fafafa;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#e3f2fd;">
                <th style="padding:6px; text-align:left;">Time</th>
                <th style="padding:6px; text-align:left;">Method</th>
                <th style="padding:6px; text-align:left;">Route</th>
                <th style="padding:6px; text-align:right;">Status</th>
                <th style="padding:6px; text-align:right;">Latency (ms)</th>
              </tr>
            </thead>
            <tbody id="obs-table-body">
              <tr><td colspan="5" style="padding:6px; text-align:center; color:#777;">No requests yet</td></tr>
            </tbody>
          </table>
        </div>
  
        <footer>Demo: Node.js + Express + OpenAPI + JWT + Metrics</footer>
      </div>
  
      <script>
        async function loadObservability() {
          try {
            const resObs = await fetch('/observability-summary');
            if (!resObs.ok) return;
            const data = await resObs.json();
  
            var totalEl = document.getElementById('obs-total');
            var errorsEl = document.getElementById('obs-errors');
            var latencyEl = document.getElementById('obs-latency');
            var tbody = document.getElementById('obs-table-body');
  
            totalEl.textContent = (data.totalRequests != null) ? data.totalRequests : 0;
            errorsEl.textContent = (data.totalErrors != null) ? data.totalErrors : 0;
            latencyEl.textContent = (data.avgLatencyMs != null) ? data.avgLatencyMs : '–';
  
            tbody.innerHTML = '';
  
            if (!data.recentRequests || data.recentRequests.length === 0) {
              var row = document.createElement('tr');
              row.innerHTML = '<td colspan="5" style="padding:6px; text-align:center; color:#777;">No requests yet</td>';
              tbody.appendChild(row);
              return;
            }
  
            data.recentRequests
              .slice()
              .reverse() // newest first
              .forEach(function (r) {
                var row = document.createElement('tr');
                row.innerHTML =
                  '<td style="padding:4px;">' + new Date(r.time).toLocaleTimeString() + '</td>' +
                  '<td style="padding:4px;">' + r.method + '</td>' +
                  '<td style="padding:4px;">' + r.route + '</td>' +
                  '<td style="padding:4px; text-align:right;">' + r.status + '</td>' +
                  '<td style="padding:4px; text-align:right;">' + r.durationMs + '</td>';
                tbody.appendChild(row);
              });
          } catch (e) {
            console.error('Failed to load observability:', e);
          }
        }
  
        loadObservability();
        setInterval(loadObservability, 5000);
      </script>
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
//app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
// ----- Swagger docs via CDN-based Swagger UI -----
app.get('/docs', (req, res) => {
    const specUrl = '/openapi.yaml'; // same origin, served by our app
  
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Patient Service API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
        <style>
          body {
            margin: 0;
            padding: 0;
          }
          #swagger-ui {
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
  
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            SwaggerUIBundle({
              url: '${specUrl}',
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
    </html>
    `);
  });

  
// ----- Auth + API routes -----
app.use('/auth', authRouter);  // POST /auth/login
app.use('/v1', v1Router);      // public v1
app.use('/v2', v2Router);      // JWT-protected v2

module.exports = app;
