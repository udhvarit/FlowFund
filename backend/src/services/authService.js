const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { User, Company, ExpenseCategory } = require('../models');

class AuthService {
  async signup(data) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.status = 409;
      throw error;
    }

    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const company = await Company.create({
        name: data.companyName,
        country: data.country,
        currencyCode: data.currencyCode
      }, { transaction });

      const adminUser = await User.create({
        companyId: company.id,
        email: data.email,
        passwordHash: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'admin'
      }, { transaction });

      const defaultCategories = [
        { name: 'Travel', icon: 'plane', description: 'Travel-related expenses' },
        { name: 'Meals & Entertainment', icon: 'utensils', description: 'Food and entertainment' },
        { name: 'Office Supplies', icon: 'paperclip', description: 'Office supplies and materials' },
        { name: 'Transportation', icon: 'car', description: 'Transportation costs' },
        { name: 'Accommodation', icon: 'bed', description: 'Hotel and lodging' },
        { name: 'Communication', icon: 'phone', description: 'Phone and internet' },
        { name: 'Equipment', icon: 'laptop', description: 'Hardware and equipment' },
        { name: 'Training', icon: 'book', description: 'Education and training' },
        { name: 'Software', icon: 'code', description: 'Software and subscriptions' },
        { name: 'Miscellaneous', icon: 'folder', description: 'Other expenses' }
      ];

      for (const cat of defaultCategories) {
        await ExpenseCategory.create({
          companyId: company.id,
          ...cat
        }, { transaction });
      }

      await transaction.commit();

      const token = this.generateToken(adminUser);
      
      return {
        user: adminUser,
        company,
        token
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Company, as: 'company' }]
    });

    if (!user || !user.isActive) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(user);
    
    return {
      user,
      token
    };
  }

  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id,
        companyId: user.companyId,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
