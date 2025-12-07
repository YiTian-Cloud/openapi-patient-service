// src/routes/v1.js
const express = require('express');
const { getAllPatients, getPatientById } = require('../data/patients');

const router = express.Router();

// GET /v1/patients
router.get('/patients', (req, res) => {
  res.json(getAllPatients());
});

// GET /v1/patients/:id
router.get('/patients/:id', (req, res) => {
  const patient = getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

module.exports = router;
