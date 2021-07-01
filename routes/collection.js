const express = require("express");
const collectionController = require('../controllers/collectionController');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/collection', isAuth, collectionController.getCollection);

router.get('/collection/:orderBy/:order', isAuth, collectionController.getCollectionSorted);

router.post('/record', isAuth, collectionController.postRecord);

router.get('/add', isAuth, collectionController.getAdd);

router.get('/edit/:recordId', isAuth, collectionController.getEditRecord);

router.post('/edit/:recordId', isAuth, collectionController.postEditRecord);

router.post('/delete/:recordId', isAuth, collectionController.deleteRecord);

module.exports = router;