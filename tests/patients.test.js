const request = require("supertest");
const app = require("../src/app");

// mock JWT for v2 tests
const jwt = require("jsonwebtoken");
const TOKEN = jwt.sign(
  { sub: "u1", username: "admin", role: "admin" },
  process.env.API_JWT_SECRET || "testsecret",
  { expiresIn: "1h" }
);

describe("Patient API tests", () => {
  
  // ----- V1 PUBLIC ENDPOINTS -----
  test("GET /v1/patients returns array", async () => {
    const res = await request(app).get("/v1/patients");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /v1/patients/:id returns patient", async () => {
    const res = await request(app).get("/v1/patients/1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", "1");
  });

  // ----- V2 SECURED ENDPOINTS -----
  test("GET /v2/patients requires token", async () => {
    const res = await request(app).get("/v2/patients");

    expect(res.status).toBe(401); // Missing Authorization header
  });

  test("GET /v2/patients works with JWT", async () => {
    const res = await request(app)
      .get("/v2/patients")
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /v2/patients creates a new patient", async () => {
    const newPatient = {
      name: "Test Person",
      birthDate: "1990-01-01",
      condition: "Flu"
    };

    const res = await request(app)
      .post("/v2/patients")
      .set("Authorization", `Bearer ${TOKEN}`)
      .send(newPatient);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Test Person");
  });
});
