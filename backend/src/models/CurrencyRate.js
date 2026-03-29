const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class CurrencyRate extends Model {}

CurrencyRate.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  baseCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'base_currency'
  },
  targetCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'target_currency'
  },
  rate: {
    type: DataTypes.DECIMAL(12, 6),
    allowNull: false
  },
  fetchedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'fetched_at'
  }
}, {
  sequelize,
  modelName: 'CurrencyRate',
  tableName: 'currency_rates',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['base_currency', 'target_currency'], unique: true }
  ]
});

module.exports = CurrencyRate;
