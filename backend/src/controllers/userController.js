const userService = require('../services/userService');

class UserController {
  async create(req, res, next) {
    try {
      const user = await userService.create(req.body, req.user.companyId);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const users = await userService.findAll(req.user.companyId);
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const user = await userService.findById(req.params.id, req.user.companyId);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.user.companyId, req.body);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const user = await userService.updateRole(req.params.id, req.user.companyId, req.body.role);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id, req.user.companyId);
      res.json({
        success: true,
        message: 'User deactivated'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
