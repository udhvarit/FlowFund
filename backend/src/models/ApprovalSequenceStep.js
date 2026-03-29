const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ApprovalSequenceStep extends Model {}

ApprovalSequenceStep.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  stepOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'step_order'
  },
  approverRole: {
    type: DataTypes.ENUM('manager', 'finance', 'director', 'cfo', 'specific_user'),
    allowNull: false,
    field: 'approver_role'
  },
  specificApproverId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'specific_approver_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_required'
  }
}, {
  sequelize,
  modelName: 'ApprovalSequenceStep',
  tableName: 'approval_sequence_steps',
  timestamps: true,
  underscored: true
});

module.exports = ApprovalSequenceStep;
