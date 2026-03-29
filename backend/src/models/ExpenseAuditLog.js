const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ExpenseAuditLog extends Model {}

ExpenseAuditLog.init({
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
  actorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'actor_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ExpenseAuditLog',
  tableName: 'expense_audit_logs',
  timestamps: true,
  underscored: true
});

module.exports = ExpenseAuditLog;
