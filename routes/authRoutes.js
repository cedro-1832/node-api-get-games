const express = require('express');
const authController = require('../controllers/authController'); // Corrección aquí

const router = express.Router();

router.post('/login', authController.login);  // Corrección aquí
router.post('/register', authController.register);  // Corrección aquí

module.exports = router;
