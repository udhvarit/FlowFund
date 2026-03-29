const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ExpenseCategory extends Model {}

ExpenseCategory.init({
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
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ExpenseCategory',
  tableName: 'expense_categories',
  timestamps: true,
  underscored: true
});

module.exports = ExpenseCategory;
