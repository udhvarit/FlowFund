const express = require('express');
const router = express.Router();
const approvalSequenceController = require('../controllers/approvalSequenceController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.use(authenticate);

router.post('/', authorize('admin'), validate(schemas.createApprovalSequence), approvalSequenceController.create);
router.get('/', approvalSequenceController.findAll);
router.get('/:id', approvalSequenceController.findById);
router.put('/:id', authorize('admin'), validate(schemas.updateApprovalSequence), approvalSequenceController.update);
router.delete('/:id', authorize('admin'), approvalSequenceController.delete);

router.post('/:id/steps', authorize('admin'), validate(schemas.createSequenceStep), approvalSequenceController.addStep);
router.put('/:id/steps/:stepId', authorize('admin'), validate(schemas.updateSequenceStep), approvalSequenceController.updateStep);
router.delete('/:id/steps/:stepId', authorize('admin'), approvalSequenceController.deleteStep);

module.exports = router;
