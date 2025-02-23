const express = require('express');
const { login, register } = require('../controllers/authController'); // Corrección aquí

const router = express.Router();

router.post('/login', login);  // Corrección aquí
router.post('/register', register);  // Corrección aquí

module.exports = router;
