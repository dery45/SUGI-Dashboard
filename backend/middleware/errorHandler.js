const notFound = (req, res, _next) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
};

const errorHandler = (err, req, res, _next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({ success: false, error: err.message || 'Terjadi kesalahan server' });
};

module.exports = { notFound, errorHandler };
