const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {
  async validatePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }
}

User.init({
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
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'employee'),
    allowNull: false,
    defaultValue: 'employee'
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'manager_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isManagerApprover: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_manager_approver'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['company_id'] },
    { fields: ['manager_id'] }
  ]
});

User.beforeCreate(async (user) => {
  if (user.passwordHash) {
    user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
  }
});

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.passwordHash;
  return values;
};

module.exports = User;
