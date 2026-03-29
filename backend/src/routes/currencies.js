const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/rates', currencyController.getRates);
router.post('/convert', currencyController.convert);

module.exports = router;
