const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.use(authenticate);

router.get('/pending', approvalController.findPending);
router.post('/:id/approve', validate(schemas.approvalAction), approvalController.approve);
router.post('/:id/reject', validate(schemas.approvalAction), approvalController.reject);

module.exports = router;
