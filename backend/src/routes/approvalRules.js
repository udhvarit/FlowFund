const express = require('express');
const router = express.Router();
const approvalRuleController = require('../controllers/approvalRuleController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.use(authenticate);

router.post('/', authorize('admin'), validate(schemas.createApprovalRule), approvalRuleController.create);
router.get('/', approvalRuleController.findAll);
router.get('/:id', approvalRuleController.findById);
router.put('/:id', authorize('admin'), validate(schemas.updateApprovalRule), approvalRuleController.update);
router.delete('/:id', authorize('admin'), approvalRuleController.delete);

module.exports = router;
