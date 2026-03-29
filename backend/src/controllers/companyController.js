const companyService = require('../services/companyService');

class CompanyController {
  async findById(req, res, next) {
    try {
      const company = await companyService.findById(req.user.companyId);
      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const company = await companyService.update(req.user.companyId, req.body);
      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyController();
