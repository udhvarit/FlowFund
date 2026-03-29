const { ApprovalRule, ApprovalSequence } = require('../models');

class ApprovalRuleService {
  async create(data, companyId) {
    const sequence = await ApprovalSequence.findOne({
      where: { id: data.sequenceId, companyId }
    });
    if (!sequence) {
      const error = new Error('Approval sequence not found');
      error.status = 404;
      throw error;
    }

    const rule = await ApprovalRule.create({
      ...data,
      companyId
    });
    return rule;
  }

  async findAll(companyId) {
    const rules = await ApprovalRule.findAll({
      where: { companyId },
      include: [
        { model: ApprovalSequence, as: 'sequence', attributes: ['id', 'name'] }
      ]
    });
    return rules;
  }

  async findById(id, companyId) {
    const rule = await ApprovalRule.findOne({
      where: { id, companyId },
      include: [
        { model: ApprovalSequence, as: 'sequence' }
      ]
    });
    if (!rule) {
      const error = new Error('Approval rule not found');
      error.status = 404;
      throw error;
    }
    return rule;
  }

  async update(id, companyId, data) {
    const rule = await ApprovalRule.findOne({ where: { id, companyId } });
    if (!rule) {
      const error = new Error('Approval rule not found');
      error.status = 404;
      throw error;
    }
    await rule.update(data);
    return rule;
  }

  async delete(id, companyId) {
    const rule = await ApprovalRule.findOne({ where: { id, companyId } });
    if (!rule) {
      const error = new Error('Approval rule not found');
      error.status = 404;
      throw error;
    }
    await rule.destroy();
  }
}

module.exports = new ApprovalRuleService();
