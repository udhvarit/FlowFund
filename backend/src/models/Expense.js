const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Expense extends Model {}

Expense.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'company_id',
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  submitterId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'submitter_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'expense_categories',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  originalCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'original_currency'
  },
  amountInCompanyCurrency: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'amount_in_company_currency'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'expense_date'
  },
  receiptUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'receipt_url'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'escalated'),
    defaultValue: 'pending'
  },
  ocrData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'ocr_data'
  },
  currentApprovalStep: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_approval_step'
  }
}, {
  sequelize,
  modelName: 'Expense',
  tableName: 'expenses',
  timestamps: true,
  underscored: true
});

module.exports = Expense;
