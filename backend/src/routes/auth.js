const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.post('/signup', validate(schemas.signup), authController.signup);
router.post('/login', validate(schemas.login), authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
