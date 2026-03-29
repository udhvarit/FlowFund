const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Company extends Model {}

Company.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  currencyCode: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'currency_code'
  }
}, {
  sequelize,
  modelName: 'Company',
  tableName: 'companies',
  timestamps: true,
  underscored: true
});

module.exports = Company;
