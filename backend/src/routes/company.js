const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.use(authenticate);

router.get('/', companyController.findById);
router.put('/', validate(schemas.updateCompany), companyController.update);

module.exports = router;
