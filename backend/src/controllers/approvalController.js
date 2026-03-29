const approvalService = require('../services/approvalService');

class ApprovalController {
  async findPending(req, res, next) {
    try {
      const requests = await approvalService.findPending(req.user.id);
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { comments } = req.body;
      const expense = await approvalService.approve(req.params.id, req.user.id, comments);
      res.json({
        success: true,
        message: 'Expense approved',
        data: expense
      });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { comments } = req.body;
      const expense = await approvalService.reject(req.params.id, req.user.id, comments);
      res.json({
        success: true,
        message: 'Expense rejected',
        data: expense
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApprovalController();
