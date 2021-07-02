const express = require("express");
const authController = require('../controllers/authController');
const router = express.Router();
const {body} = require('express-validator');
const User = require('../models/User');

router.post('/register', [
    body('username')
        .trim()
        .isAlphanumeric()
        .isLength({min: 4})
        .withMessage('Please enter an alphanumeric username with minimum length of 4 characters.')
        .custom((value, { req }) => {
            return User.find({ username: value }).then(user => {
                if (user[0]) {
                    return Promise.reject('Username already exists, please use a different username.');
                }
            });
        }),
    body('password')
        .trim()
        .isLength({min: 3})
        .withMessage('Minimum password length is 3 characters.')
], authController.postRegister);

router.get('/register', authController.getRegister);

router.get('/login', authController.getLogin);

router.post('/login', [
    body('username')
        .trim()
        .isAlphanumeric()
        .isLength({min: 4})
        .withMessage('Please enter an alphanumeric username with minimum length of 4 characters.'),
    body('password')
        .trim()
        .isLength({min: 3})
        .withMessage('Minimum password length is 3 characters.')
], authController.postLogin);

router.get('/logout', authController.getLogout);

module.exports = router;