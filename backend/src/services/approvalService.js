const { Expense, ApprovalRequest, ApprovalSequence, ApprovalSequenceStep, User, ExpenseAuditLog } = require('../models');

class ApprovalService {
  async findPending(approverId) {
    const requests = await ApprovalRequest.findAll({
      where: {
        approverId,
        status: 'pending'
      },
      include: [
        { model: Expense, as: 'expense' }
      ]
    });
    return requests;
  }

  async approve(expenseId, approverId, comments) {
    const expense = await Expense.findByPk(expenseId, {
      include: [
        { model: ApprovalSequenceStep, as: 'approvalSequence' }
      ]
    });
    
    if (!expense) {
      const error = new Error('Expense not found');
      error.status = 404;
      throw error;
    }

    const currentStep = await ApprovalSequenceStep.findByPk(expense.currentApprovalStep);
    
    if (!currentStep) {
      const error = new Error('No approval step found');
      error.status = 400;
      throw error;
    }

    await ApprovalRequest.create({
      expenseId,
      approverId,
      stepId: currentStep.id,
      status: 'approved',
      comments,
      decidedAt: new Date()
    });

    const nextStepOrder = currentStep.stepOrder + 1;
    const nextStep = await ApprovalSequenceStep.findOne({
      where: {
        sequenceId: currentStep.sequenceId,
        stepOrder: nextStepOrder
      }
    });

    if (nextStep) {
      await expense.update({
        currentApprovalStep: nextStep.id,
        status: 'pending'
      });

      await ExpenseAuditLog.create({
        expenseId,
        actorId: approverId,
        action: 'escalated',
        details: { toStep: nextStep.stepOrder }
      });
    } else {
      await expense.update({
        status: 'approved',
        currentApprovalStep: 0
      });

      await ExpenseAuditLog.create({
        expenseId,
        actorId: approverId,
        action: 'approved',
        details: {}
      });
    }

    return expense;
  }

  async reject(expenseId, approverId, comments) {
    const expense = await Expense.findByPk(expenseId);
    
    if (!expense) {
      const error = new Error('Expense not found');
      error.status = 404;
      throw error;
    }

    const currentStep = await ApprovalSequenceStep.findByPk(expense.currentApprovalStep);
    
    await ApprovalRequest.create({
      expenseId,
      approverId,
      stepId: currentStep?.id,
      status: 'rejected',
      comments,
      decidedAt: new Date()
    });

    await expense.update({
      status: 'rejected'
    });

    await ExpenseAuditLog.create({
      expenseId,
      actorId: approverId,
      action: 'rejected',
      details: { comments }
    });

    return expense;
  }
}

module.exports = new ApprovalService();
