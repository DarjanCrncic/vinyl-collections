const express = require('express');

const router = express.Router();
const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/userController');


router.get('/users', isAuth, userController.getOtherUsers);

router.get('/users/collection/:userId/:username', isAuth, userController.getUserCollection);

router.post('/users/search', isAuth, userController.searchUsers);

module.exports = router;