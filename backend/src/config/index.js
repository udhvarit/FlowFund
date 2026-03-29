require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  exchangeRateApi: process.env.EXCHANGE_RATE_API || 'https://api.exchangerate-api.com/v4/latest'
};
