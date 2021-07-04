const express = require("express");
const collectionController = require('../controllers/collectionController');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/collection/:orderBy/:order/:page', isAuth, collectionController.getCollectionSorted);

router.post('/record', isAuth, collectionController.postRecord);

router.get('/add', isAuth, collectionController.getAdd);

router.get('/edit/:recordId/:orderBy/:order/:page', isAuth, collectionController.getEditRecord);

router.post('/edit/:recordId/:orderBy/:order/:page', isAuth, collectionController.postEditRecord);

router.post('/delete/:recordId/:orderBy/:order/:page', isAuth, collectionController.deleteRecord);

router.get('/view/:recordId', isAuth, collectionController.getViewRecord)

module.exports = router;