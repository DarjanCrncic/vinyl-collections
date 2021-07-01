const express = require("express");
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.postRegister);

router.get('/register', authController.getRegister);

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/logout', authController.getLogout);

module.exports = router;