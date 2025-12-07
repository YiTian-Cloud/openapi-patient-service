// src/data/patients.js

let patients = [
    { id: '1', name: 'Alice Smith', birthDate: '1980-05-10', condition: 'Hypertension' },
    { id: '2', name: 'Bob Lee',   birthDate: '1975-09-22', condition: 'Diabetes' },
  ];
  
  function getAllPatients() {
    return patients;
  }
  
  function getPatientById(id) {
    return patients.find(p => p.id === id);
  }
  
  function addPatient({ name, birthDate, condition }) {
    const newPatient = {
      id: String(patients.length + 1),
      name,
      birthDate,
      condition: condition || null,
    };
    patients.push(newPatient);
    return newPatient;
  }
  
  module.exports = {
    getAllPatients,
    getPatientById,
    addPatient,
  };
  