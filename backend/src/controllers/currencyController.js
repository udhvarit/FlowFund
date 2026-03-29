const currencyService = require('../services/currencyService');
const { CurrencyRate } = require('../models');

class CurrencyController {
  async getRates(req, res, next) {
    try {
      const { baseCurrency } = req.query;
      if (!baseCurrency) {
        return res.status(400).json({
          success: false,
          message: 'Base currency is required'
        });
      }

      const rates = await CurrencyRate.findAll({
        where: { baseCurrency }
      });

      res.json({
        success: true,
        data: rates
      });
    } catch (error) {
      next(error);
    }
  }

  async convert(req, res, next) {
    try {
      const { amount, from, to } = req.body;
      
      if (!amount || !from || !to) {
        return res.status(400).json({
          success: false,
          message: 'Amount, from, and to currencies are required'
        });
      }

      const converted = await currencyService.convertAmount(amount, from, to);
      
      res.json({
        success: true,
        data: {
          originalAmount: amount,
          convertedAmount: converted,
          from,
          to
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CurrencyController();
