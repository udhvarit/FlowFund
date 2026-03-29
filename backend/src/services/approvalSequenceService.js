const { ApprovalSequence, ApprovalSequenceStep, ApprovalRule, User } = require('../models');

class ApprovalSequenceService {
  async create(data, companyId) {
    const sequence = await ApprovalSequence.create({
      ...data,
      companyId
    });
    return sequence;
  }

  async findAll(companyId) {
    const sequences = await ApprovalSequence.findAll({
      where: { companyId },
      include: [
        { model: ApprovalSequenceStep, as: 'steps', order: [['stepOrder', 'ASC']] }
      ],
      order: [['name', 'ASC']]
    });
    return sequences;
  }

  async findById(id, companyId) {
    const sequence = await ApprovalSequence.findOne({
      where: { id, companyId },
      include: [
        { model: ApprovalSequenceStep, as: 'steps', order: [['stepOrder', 'ASC']] }
      ]
    });
    if (!sequence) {
      const error = new Error('Approval sequence not found');
      error.status = 404;
      throw error;
    }
    return sequence;
  }

  async update(id, companyId, data) {
    const sequence = await ApprovalSequence.findOne({ where: { id, companyId } });
    if (!sequence) {
      const error = new Error('Approval sequence not found');
      error.status = 404;
      throw error;
    }
    await sequence.update(data);
    return sequence;
  }

  async delete(id, companyId) {
    const sequence = await ApprovalSequence.findOne({ where: { id, companyId } });
    if (!sequence) {
      const error = new Error('Approval sequence not found');
      error.status = 404;
      throw error;
    }
    await sequence.destroy();
  }

  async addStep(sequenceId, companyId, data) {
    const sequence = await ApprovalSequence.findOne({ where: { id: sequenceId, companyId } });
    if (!sequence) {
      const error = new Error('Approval sequence not found');
      error.status = 404;
      throw error;
    }

    const step = await ApprovalSequenceStep.create({
      ...data,
      sequenceId
    });
    return step;
  }

  async updateStep(stepId, sequenceId, companyId, data) {
    const step = await ApprovalSequenceStep.findOne({
      where: { id: stepId, sequenceId }
    });
    if (!step) {
      const error = new Error('Step not found');
      error.status = 404;
      throw error;
    }
    await step.update(data);
    return step;
  }

  async deleteStep(stepId, sequenceId, companyId) {
    const step = await ApprovalSequenceStep.findOne({
      where: { id: stepId, sequenceId }
    });
    if (!step) {
      const error = new Error('Step not found');
      error.status = 404;
      throw error;
    }
    await step.destroy();
  }
}

module.exports = new ApprovalSequenceService();
