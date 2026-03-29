const { User, Company } = require('../models');
const bcrypt = require('bcryptjs');

class UserService {
  async create(data, companyId) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.status = 409;
      throw error;
    }

    const user = await User.create({
      ...data,
      companyId,
      passwordHash: data.password
    });

    return user;
  }

  async findAll(companyId) {
    const users = await User.findAll({
      where: { companyId },
      include: [
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'directReports', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    return users;
  }

  async findById(id, companyId) {
    const user = await User.findOne({
      where: { id, companyId },
      include: [
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'directReports', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Company, as: 'company' }
      ]
    });

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return user;
  }

  async update(id, companyId, data) {
    const user = await User.findOne({ where: { id, companyId } });
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    if (data.password) {
      data.passwordHash = data.password;
      delete data.password;
    }

    await user.update(data);
    return user;
  }

  async updateRole(id, companyId, role) {
    const user = await User.findOne({ where: { id, companyId } });
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    await user.update({ role });
    return user;
  }

  async delete(id, companyId) {
    const user = await User.findOne({ where: { id, companyId } });
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    if (user.role === 'admin') {
      const error = new Error('Cannot delete admin user');
      error.status = 400;
      throw error;
    }

    await user.update({ isActive: false });
  }
}

module.exports = new UserService();
