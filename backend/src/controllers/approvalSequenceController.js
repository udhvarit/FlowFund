const approvalSequenceService = require('../services/approvalSequenceService');

class ApprovalSequenceController {
  async create(req, res, next) {
    try {
      const sequence = await approvalSequenceService.create(req.body, req.user.companyId);
      res.status(201).json({
        success: true,
        data: sequence
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const sequences = await approvalSequenceService.findAll(req.user.companyId);
      res.json({
        success: true,
        data: sequences
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const sequence = await approvalSequenceService.findById(req.params.id, req.user.companyId);
      res.json({
        success: true,
        data: sequence
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const sequence = await approvalSequenceService.update(req.params.id, req.user.companyId, req.body);
      res.json({
        success: true,
        data: sequence
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await approvalSequenceService.delete(req.params.id, req.user.companyId);
      res.json({
        success: true,
        message: 'Approval sequence deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  async addStep(req, res, next) {
    try {
      const step = await approvalSequenceService.addStep(req.params.id, req.user.companyId, req.body);
      res.status(201).json({
        success: true,
        data: step
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStep(req, res, next) {
    try {
      const step = await approvalSequenceService.updateStep(
        req.params.stepId,
        req.params.id,
        req.user.companyId,
        req.body
      );
      res.json({
        success: true,
        data: step
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStep(req, res, next) {
    try {
      await approvalSequenceService.deleteStep(req.params.stepId, req.params.id, req.user.companyId);
      res.json({
        success: true,
        message: 'Step deleted'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApprovalSequenceController();
