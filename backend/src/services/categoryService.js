const { ExpenseCategory } = require('../models');

class CategoryService {
  async create(data, companyId) {
    const category = await ExpenseCategory.create({
      ...data,
      companyId
    });
    return category;
  }

  async findAll(companyId) {
    const categories = await ExpenseCategory.findAll({
      where: { companyId },
      order: [['name', 'ASC']]
    });
    return categories;
  }

  async findById(id, companyId) {
    const category = await ExpenseCategory.findOne({
      where: { id, companyId }
    });
    if (!category) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }
    return category;
  }

  async update(id, companyId, data) {
    const category = await ExpenseCategory.findOne({
      where: { id, companyId }
    });
    if (!category) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }
    await category.update(data);
    return category;
  }

  async delete(id, companyId) {
    const category = await ExpenseCategory.findOne({
      where: { id, companyId }
    });
    if (!category) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }
    await category.destroy();
  }
}

module.exports = new CategoryService();
