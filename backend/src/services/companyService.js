const { Company } = require('../models');

class CompanyService {
  async findById(id) {
    const company = await Company.findByPk(id);
    if (!company) {
      const error = new Error('Company not found');
      error.status = 404;
      throw error;
    }
    return company;
  }

  async update(id, data) {
    const company = await Company.findByPk(id);
    if (!company) {
      const error = new Error('Company not found');
      error.status = 404;
      throw error;
    }
    await company.update(data);
    return company;
  }
}

module.exports = new CompanyService();
