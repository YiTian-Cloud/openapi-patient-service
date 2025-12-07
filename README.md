# OpenAPI Patient Service (API-First Demo)

![Build Status](https://github.com/YiTian-Cloud/openapi-patient-service/actions/workflows/ci.yml/badge.svg)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YiTian-Cloud/openapi-patient-service)

**Live Demo:** https://openapi-patient-service.vercel.app  <!-- replace with your actual Vercel URL once deployed -->

OpenAPI Patient Service (API-First Demo)

A lightweight demo service that shows how to build an API-First application using:

OpenAPI 3.0 YAML spec

Express.js

JWT-based authentication

Versioned APIs (v1 public, v2 secured)

Auto-generated API Docs (Swagger UI)

This project demonstrates how writing the OpenAPI contract first drives consistent API design, documentation, and implementation.

🚀 Features
API-First OpenAPI 3.0 Design

Complete OpenAPI spec (openapi.yaml)

Auto-documented with Swagger UI at /docs

Schemas, request/response bodies, versioning

Versioned Endpoints
Version	Path	Security	Notes
v1	/v1/patients	❌ Public	For simple unauthenticated demo use
v2	/v2/patients	✅ JWT Required	Shows API hardening & auth patterns
Authentication

/auth/login issues a real JWT token

All v2 endpoints require Authorization: Bearer <token>

Secret stored in .env

Landing Page

Simple landing page with:

Link to /docs

Button to view raw openapi.yaml

📁 Project Structure
openapi-patient-service/
│
├── openapi.yaml          # API contract (source of truth)
├── server.js             # Express app
├── auth/
│   └── login.js          # Login handler + JWT generation
├── routes/
│   ├── v1.js             # Public endpoints
│   └── v2.js             # Secured endpoints
├── middleware/
│   └── auth.js           # JWT verification
├── public/
│   └── index.html        # Simple landing page
└── package.json

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