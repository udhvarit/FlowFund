const { Expense, User, ExpenseCategory, Company, ExpenseAuditLog } = require('../models');
const currencyService = require('./currencyService');

class ExpenseService {
  async create(data, userId, companyId) {
    const company = await Company.findByPk(companyId);
    
    const amountInCompanyCurrency = await currencyService.convertAmount(
      data.amount,
      data.originalCurrency,
      company.currencyCode
    );

    const expense = await Expense.create({
      ...data,
      submitterId: userId,
      companyId,
      amountInCompanyCurrency
    });

    await ExpenseAuditLog.create({
      expenseId: expense.id,
      actorId: userId,
      action: 'created',
      details: { amount: data.amount, currency: data.originalCurrency }
    });

    return expense;
  }

  async findAll(companyId, filters = {}) {
    const where = { companyId };
    
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.submitterId) {
      where.submitterId = filters.submitterId;
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: ExpenseCategory, as: 'category', attributes: ['id', 'name', 'icon'] }
      ],
      order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']]
    });

    return expenses;
  }

  async findById(id, companyId) {
    const expense = await Expense.findOne({
      where: { id, companyId },
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: ExpenseCategory, as: 'category', attributes: ['id', 'name', 'icon'] },
        { model: Company, as: 'company' }
      ]
    });

    if (!expense) {
      const error = new Error('Expense not found');
      error.status = 404;
      throw error;
    }

    return expense;
  }

  async update(id, companyId, userId, data) {
    const expense = await Expense.findOne({ where: { id, companyId } });
    
    if (!expense) {
      const error = new Error('Expense not found');
      error.status = 404;
      throw error;
    }

    if (expense.status !== 'pending') {
      const error = new Error('Can only update pending expenses');
      error.status = 400;
      throw error;
    }

    if (data.amount || data.originalCurrency) {
      const company = await Company.findByPk(companyId);
      const amount = data.amount || expense.amount;
      const currency = data.originalCurrency || expense.originalCurrency;
      
      data.amountInCompanyCurrency = await currencyService.convertAmount(
        amount,
        currency,
        company.currencyCode
      );
    }

    await expense.update(data);

    await ExpenseAuditLog.create({
      expenseId: expense.id,
      actorId: userId,
      action: 'updated',
      details: data
    });

    return expense;
  }

  async delete(id, companyId, userId) {
    const expense = await Expense.findOne({ where: { id, companyId } });
    
    if (!expense) {
      const error = new Error('Expense not found');
      error.status = 404;
      throw error;
    }

    if (expense.status !== 'pending') {
      const error = new Error('Can only delete pending expenses');
      error.status = 400;
      throw error;
    }

    await ExpenseAuditLog.create({
      expenseId: expense.id,
      actorId: userId,
      action: 'deleted',
      details: {}
    });

    await expense.destroy();
  }

  async getStats(companyId, userId, role) {
    const where = { companyId };
    
    if (role === 'employee') {
      where.submitterId = userId;
    }

    const total = await Expense.count({ where });
    const pending = await Expense.count({ where: { ...where, status: 'pending' } });
    const approved = await Expense.count({ where: { ...where, status: 'approved' } });
    const rejected = await Expense.count({ where: { ...where, status: 'rejected' } });

    const amountWhere = role === 'employee' ? { submitterId: userId, companyId } : { companyId };
    const expenses = await Expense.findAll({ where: amountWhere });
    const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amountInCompanyCurrency), 0);

    return { total, pending, approved, rejected, totalAmount };
  }
}

module.exports = new ExpenseService();
