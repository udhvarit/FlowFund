const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.use(authenticate);

router.post('/', authorize('admin'), validate(schemas.createCategory), categoryController.create);
router.get('/', categoryController.findAll);
router.get('/:id', categoryController.findById);
router.put('/:id', authorize('admin'), validate(schemas.updateCategory), categoryController.update);
router.delete('/:id', authorize('admin'), categoryController.delete);

module.exports = router;
