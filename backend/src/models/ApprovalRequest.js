const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ApprovalRequest extends Model {}

ApprovalRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  expenseId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'expense_id',
    references: {
      model: 'expenses',
      key: 'id'
    }
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'approver_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  stepId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'step_id',
    references: {
      model: 'approval_sequence_steps',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  decidedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'decided_at'
  }
}, {
  sequelize,
  modelName: 'ApprovalRequest',
  tableName: 'approval_requests',
  timestamps: true,
  underscored: true
});

module.exports = ApprovalRequest;
