const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ApprovalSequence extends Model {}

ApprovalSequence.init({
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  minAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'min_amount'
  },
  maxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'max_amount'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  sequelize,
  modelName: 'ApprovalSequence',
  tableName: 'approval_sequences',
  timestamps: true,
  underscored: true
});

module.exports = ApprovalSequence;
