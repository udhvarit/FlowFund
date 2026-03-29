const sequelize = require('../config/database');
const Company = require('./Company');
const User = require('./User');
const ExpenseCategory = require('./ExpenseCategory');
const Expense = require('./Expense');
const ApprovalSequence = require('./ApprovalSequence');
const ApprovalSequenceStep = require('./ApprovalSequenceStep');
const ApprovalRule = require('./ApprovalRule');
const ApprovalRequest = require('./ApprovalRequest');
const ExpenseAuditLog = require('./ExpenseAuditLog');
const CurrencyRate = require('./CurrencyRate');

Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

User.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
User.hasMany(User, { foreignKey: 'managerId', as: 'directReports' });

Company.hasMany(ExpenseCategory, { foreignKey: 'companyId', as: 'categories' });
ExpenseCategory.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Company.hasMany(Expense, { foreignKey: 'companyId', as: 'expenses' });
Expense.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Expense.belongsTo(User, { foreignKey: 'submitterId', as: 'submitter' });
User.hasMany(Expense, { foreignKey: 'submitterId', as: 'submittedExpenses' });

Expense.belongsTo(ExpenseCategory, { foreignKey: 'categoryId', as: 'category' });
ExpenseCategory.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });

Company.hasMany(ApprovalSequence, { foreignKey: 'companyId', as: 'approvalSequences' });
ApprovalSequence.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

ApprovalSequence.hasMany(ApprovalSequenceStep, { foreignKey: 'sequenceId', as: 'steps' });
ApprovalSequenceStep.belongsTo(ApprovalSequence, { foreignKey: 'sequenceId', as: 'sequence' });

ApprovalSequenceStep.belongsTo(User, { foreignKey: 'specificApproverId', as: 'specificApprover' });
User.hasMany(ApprovalSequenceStep, { foreignKey: 'specificApproverId', as: 'assignedApprovalSteps' });

Company.hasMany(ApprovalRule, { foreignKey: 'companyId', as: 'approvalRules' });
ApprovalRule.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

ApprovalRule.belongsTo(ApprovalSequence, { foreignKey: 'sequenceId', as: 'sequence' });
ApprovalSequence.hasMany(ApprovalRule, { foreignKey: 'sequenceId', as: 'rules' });

ApprovalRule.belongsTo(User, { foreignKey: 'requiredApproverId', as: 'requiredApprover' });

ApprovalRequest.belongsTo(Expense, { foreignKey: 'expenseId', as: 'expense' });
Expense.hasMany(ApprovalRequest, { foreignKey: 'expenseId', as: 'approvalRequests' });

ApprovalRequest.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });
User.hasMany(ApprovalRequest, { foreignKey: 'approverId', as: 'pendingApprovals' });

ApprovalRequest.belongsTo(ApprovalSequenceStep, { foreignKey: 'stepId', as: 'step' });
ApprovalSequenceStep.hasMany(ApprovalRequest, { foreignKey: 'stepId', as: 'requests' });

ExpenseAuditLog.belongsTo(Expense, { foreignKey: 'expenseId', as: 'expense' });
Expense.hasMany(ExpenseAuditLog, { foreignKey: 'expenseId', as: 'auditLogs' });

ExpenseAuditLog.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });
User.hasMany(ExpenseAuditLog, { foreignKey: 'actorId', as: 'auditActions' });

module.exports = {
  sequelize,
  Company,
  User,
  ExpenseCategory,
  Expense,
  ApprovalSequence,
  ApprovalSequenceStep,
  ApprovalRule,
  ApprovalRequest,
  ExpenseAuditLog,
  CurrencyRate
};
