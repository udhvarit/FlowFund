const categoryService = require('../services/categoryService');

class CategoryController {
  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body, req.user.companyId);
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const categories = await categoryService.findAll(req.user.companyId);
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const category = await categoryService.findById(req.params.id, req.user.companyId);
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const category = await categoryService.update(req.params.id, req.user.companyId, req.body);
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await categoryService.delete(req.params.id, req.user.companyId);
      res.json({
        success: true,
        message: 'Category deleted'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
