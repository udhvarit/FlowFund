const expenseService = require('../services/expenseService');

class ExpenseController {
  async create(req, res, next) {
    try {
      const expense = await expenseService.create(req.body, req.user.id, req.user.companyId);
      res.status(201).json({
        success: true,
        data: expense
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        submitterId: req.query.submitterId
      };
      const expenses = await expenseService.findAll(req.user.companyId, filters);
      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const expense = await expenseService.findById(req.params.id, req.user.companyId);
      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const expense = await expenseService.update(
        req.params.id,
        req.user.companyId,
        req.user.id,
        req.body
      );
      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await expenseService.delete(req.params.id, req.user.companyId, req.user.id);
      res.json({
        success: true,
        message: 'Expense deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await expenseService.getStats(req.user.companyId, req.user.id, req.user.role);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpenseController();
