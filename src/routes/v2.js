// src/routes/v2.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getAllPatients, getPatientById, addPatient } = require('../data/patients');

const router = express.Router();

// Apply JWT auth to all v2 routes
router.use(authMiddleware);

// GET /v2/patients
router.get('/patients', (req, res) => {
  res.json(getAllPatients());
});

// POST /v2/patients
router.post('/patients', (req, res) => {
  const { name, birthDate, condition } = req.body;

  if (!name || !birthDate) {
    return res.status(400).json({ error: 'name and birthDate are required' });
  }

  const newPatient = addPatient({ name, birthDate, condition });
  res.status(201).json(newPatient);
});

// GET /v2/patients/:id
router.get('/patients/:id', (req, res) => {
  const patient = getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

module.exports = router;
