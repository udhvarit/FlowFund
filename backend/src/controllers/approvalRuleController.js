const approvalRuleService = require('../services/approvalRuleService');

class ApprovalRuleController {
  async create(req, res, next) {
    try {
      const rule = await approvalRuleService.create(req.body, req.user.companyId);
      res.status(201).json({
        success: true,
        data: rule
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const rules = await approvalRuleService.findAll(req.user.companyId);
      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const rule = await approvalRuleService.findById(req.params.id, req.user.companyId);
      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const rule = await approvalRuleService.update(req.params.id, req.user.companyId, req.body);
      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await approvalRuleService.delete(req.params.id, req.user.companyId);
      res.json({
        success: true,
        message: 'Approval rule deleted'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApprovalRuleController();
