const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.use(authenticate);

router.post('/', validate(schemas.createExpense), expenseController.create);
router.get('/', expenseController.findAll);
router.get('/stats', expenseController.getStats);
router.get('/:id', expenseController.findById);
router.put('/:id', validate(schemas.updateExpense), expenseController.update);
router.delete('/:id', expenseController.delete);

module.exports = router;
