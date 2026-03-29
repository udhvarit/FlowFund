const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Record already exists',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFound
};
