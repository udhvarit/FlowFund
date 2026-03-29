const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    next();
  };
};

const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    companyName: Joi.string().min(1).max(255).required(),
    country: Joi.string().min(1).max(100).required(),
    currencyCode: Joi.string().length(3).uppercase().required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    role: Joi.string().valid('admin', 'manager', 'employee').required(),
    managerId: Joi.string().uuid().allow(null),
    isManagerApprover: Joi.boolean().default(false)
  }),

  updateUser: Joi.object({
    firstName: Joi.string().min(1).max(100),
    lastName: Joi.string().min(1).max(100),
    managerId: Joi.string().uuid().allow(null),
    isManagerApprover: Joi.boolean(),
    isActive: Joi.boolean()
  }),

  updateUserRole: Joi.object({
    role: Joi.string().valid('admin', 'manager', 'employee').required()
  }),

  createExpense: Joi.object({
    categoryId: Joi.string().uuid().required(),
    amount: Joi.number().positive().precision(2).required(),
    originalCurrency: Joi.string().length(3).uppercase().required(),
    description: Joi.string().max(1000).allow('', null),
    expenseDate: Joi.date().iso().required(),
    receiptUrl: Joi.string().uri().allow('', null),
    ocrData: Joi.object().allow(null)
  }),

  updateExpense: Joi.object({
    categoryId: Joi.string().uuid(),
    amount: Joi.number().positive().precision(2),
    description: Joi.string().max(1000).allow('', null),
    expenseDate: Joi.date().iso(),
    receiptUrl: Joi.string().uri().allow('', null)
  }),

  createCategory: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    icon: Joi.string().max(50).allow('', null)
  }),

  updateCategory: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().max(500).allow('', null),
    icon: Joi.string().max(50).allow('', null)
  }),

  createApprovalSequence: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    minAmount: Joi.number().min(0).precision(2).default(0),
    maxAmount: Joi.number().min(0).precision(2).allow(null),
    isActive: Joi.boolean().default(true)
  }),

  updateApprovalSequence: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().max(500).allow('', null),
    minAmount: Joi.number().min(0).precision(2),
    maxAmount: Joi.number().min(0).precision(2).allow(null),
    isActive: Joi.boolean()
  }),

  createSequenceStep: Joi.object({
    stepOrder: Joi.number().integer().min(1).required(),
    approverRole: Joi.string().valid('manager', 'finance', 'director', 'cfo', 'specific_user').required(),
    specificApproverId: Joi.string().uuid().allow(null),
    isRequired: Joi.boolean().default(true)
  }),

  updateSequenceStep: Joi.object({
    stepOrder: Joi.number().integer().min(1),
    approverRole: Joi.string().valid('manager', 'finance', 'director', 'cfo', 'specific_user'),
    specificApproverId: Joi.string().uuid().allow(null),
    isRequired: Joi.boolean()
  }),

  createApprovalRule: Joi.object({
    sequenceId: Joi.string().uuid().required(),
    ruleType: Joi.string().valid('percentage', 'specific_approver', 'hybrid').required(),
    percentageThreshold: Joi.number().integer().min(0).max(100).when('ruleType', {
      is: Joi.valid('percentage', 'hybrid'),
      then: Joi.required()
    }),
    requiredApproverId: Joi.string().uuid().when('ruleType', {
      is: Joi.valid('specific_approver', 'hybrid'),
      then: Joi.required()
    }),
    conditionLogic: Joi.string().valid('and', 'or').default('or')
  }),

  updateApprovalRule: Joi.object({
    ruleType: Joi.string().valid('percentage', 'specific_approver', 'hybrid'),
    percentageThreshold: Joi.number().integer().min(0).max(100),
    requiredApproverId: Joi.string().uuid().allow(null),
    conditionLogic: Joi.string().valid('and', 'or')
  }),

  approvalAction: Joi.object({
    comments: Joi.string().max(1000).allow('', null)
  }),

  updateCompany: Joi.object({
    name: Joi.string().min(1).max(255),
    country: Joi.string().min(1).max(100),
    currencyCode: Joi.string().length(3).uppercase()
  })
};

module.exports = {
  validate,
  schemas
};
