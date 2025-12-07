# OpenAPI Patient Service (API-First Demo)

[![Build Status](https://github.com/YiTian-Cloud/openapi-patient-service/actions/workflows/ci.yml/badge.svg)](https://github.com/YiTian-Cloud/openapi-patient-service/actions/workflows/ci.yml)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YiTian-Cloud/openapi-patient-service)

**Live Demo:** https://openapi-patient-service.vercel.app <!-- replace with your actual Vercel URL -->

A small but realistic backend demo that shows how to build an **API-first** service using:

- **OpenAPI 3.0** (`openapi.yaml`) as the contract  
- **Express.js** with a clean modular structure (`src/…`)  
- **JWT-secured v2 API** with `/auth/login`  
- **Versioned APIs**: `v1` (public) and `v2` (secured)  
- **Auto-generated docs** with Swagger UI  

Perfect as a portfolio piece for platform / API / healthcare-adjacent roles.

---

## 📁 Project Structure

```text
openapi-patient-service/
│
├── src/
│   ├── app.js              # Builds the Express app: routes, Swagger, landing page
│   ├── routes/
│   │   ├── v1.js           # Public v1 endpoints
│   │   └── v2.js           # JWT-protected v2 endpoints
│   ├── auth/
│   │   └── login.js        # POST /auth/login -> issues JWT
│   ├── middleware/
│   │   └── auth.js         # JWT auth middleware for v2
│   └── data/
│       └── patients.js     # In-memory patient store utilities
│
├── tests/
│   └── patients.test.js    # Jest + supertest API tests for v1 & v2
│
├── api/
│   └── index.js            # Vercel serverless entry (wraps Express app)
│
├── index.js                # Local dev entrypoint (node index.js)
├── openapi.yaml            # OpenAPI 3.0 contract (used by Swagger UI)
├── vercel.json             # Routes all traffic to /api/index on Vercel
├── package.json
└── README.md


🧪 Running Locally
1. Install dependencies
npm install

2. Configure environment

Create a .env file:

JWT_SECRET=your-secret-here
TOKEN_EXPIRES_IN=1h

3. Start the server
npm start


Server runs at:

http://localhost:3000

📘 API Documentation

Once running:

👉 Swagger UI

http://localhost:3000/docs


👉 Raw OpenAPI YAML

http://localhost:3000/openapi.yaml

🔐 Authentication Flow

POST /auth/login with JSON body:

{
  "username": "admin",
  "password": "password123"
}


Server returns a JWT:

{
  "token": "<your-jwt-token>"
}


Call v2 routes:

GET /v2/patients
Authorization: Bearer <token>

🌐 Deploying to Vercel

Push repository to GitHub

Import project into Vercel

Add environment variables under:
Project → Settings → Environment Variables

JWT_SECRET=your-secret-here
TOKEN_EXPIRES_IN=1h


Deploy 🎉

📌 Purpose of This Demo

This project is intentionally simple. It demonstrates:

How OpenAPI-first helps enforce consistency

How to document APIs using YAML

How to implement Express routes based on the contract

How API versioning works

How to secure endpoints with JWT