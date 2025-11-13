const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/ranking', authController.getRanking);

// Rutas protegidas (requieren autenticación)
router.get('/profile', auth, authController.getProfile);
router.put('/score', auth, authController.updateScore);

module.exports = router;
