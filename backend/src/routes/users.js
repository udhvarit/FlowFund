const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.use(authenticate);

router.post('/', authorize('admin'), validate(schemas.createUser), userController.create);
router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.put('/:id', validate(schemas.updateUser), userController.update);
router.patch('/:id/role', validate(schemas.updateUserRole), userController.updateRole);
router.delete('/:id', authorize('admin'), userController.delete);

module.exports = router;
