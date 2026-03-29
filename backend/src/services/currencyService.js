const axios = require('axios');
const config = require('../config');
const { CurrencyRate, Company } = require('../models');

class CurrencyService {
  async getExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    let rate = await CurrencyRate.findOne({
      where: {
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency
      }
    });

    if (rate) {
      const hoursSinceFetch = (Date.now() - rate.fetchedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceFetch < 24) {
        return parseFloat(rate.rate);
      }
    }

    await this.fetchAndStoreRates(fromCurrency);
    
    rate = await CurrencyRate.findOne({
      where: {
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency
      }
    });

    return rate ? parseFloat(rate.rate) : null;
  }

  async fetchAndStoreRates(baseCurrency) {
    try {
      const response = await axios.get(`${config.exchangeRateApi}/${baseCurrency}`);
      const rates = response.data.rates;

      const now = new Date();
      
      for (const [currency, rate] of Object.entries(rates)) {
        await CurrencyRate.upsert({
          baseCurrency,
          targetCurrency: currency,
          rate,
          fetchedAt: now
        }, {
          where: {
            baseCurrency,
            targetCurrency: currency
          }
        });
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      throw error;
    }
  }

  async convertAmount(amount, fromCurrency, toCurrency) {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    if (rate === null) {
      const error = new Error('Exchange rate not available');
      error.status = 400;
      throw error;
    }
    return amount * rate;
  }
}

module.exports = new CurrencyService();
