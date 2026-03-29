const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ApprovalRule extends Model {}

ApprovalRule.init({
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
  sequenceId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sequence_id',
    references: {
      model: 'approval_sequences',
      key: 'id'
    }
  },
  ruleType: {
    type: DataTypes.ENUM('percentage', 'specific_approver', 'hybrid'),
    allowNull: false,
    field: 'rule_type'
  },
  percentageThreshold: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'percentage_threshold'
  },
  requiredApproverId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'required_approver_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  conditionLogic: {
    type: DataTypes.ENUM('and', 'or'),
    defaultValue: 'or',
    field: 'condition_logic'
  }
}, {
  sequelize,
  modelName: 'ApprovalRule',
  tableName: 'approval_rules',
  timestamps: true,
  underscored: true
});

module.exports = ApprovalRule;
