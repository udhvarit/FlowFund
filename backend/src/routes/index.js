const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const companyRoutes = require('./company');
const expenseRoutes = require('./expenses');
const approvalRoutes = require('./approvals');
const categoryRoutes = require('./categories');
const approvalSequenceRoutes = require('./approvalSequences');
const approvalRuleRoutes = require('./approvalRules');
const currencyRoutes = require('./currencies');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/company', companyRoutes);
router.use('/expenses', expenseRoutes);
router.use('/approvals', approvalRoutes);
router.use('/categories', categoryRoutes);
router.use('/approval-sequences', approvalSequenceRoutes);
router.use('/approval-rules', approvalRuleRoutes);
router.use('/currencies', currencyRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
