const mongoose = require('mongoose');

const required = (value, fieldName) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} wajib diisi`;
  }
  return null;
};

const isObjectId = (value, fieldName) => {
  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    return `${fieldName} tidak valid`;
  }
  return null;
};

const isNumber = (value, fieldName) => {
  if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
    return `${fieldName} harus berupa angka`;
  }
  return null;
};

const isEmail = (value) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Format email tidak valid';
  }
  return null;
};

const minLength = (value, min, fieldName) => {
  if (value && String(value).length < min) {
    return `${fieldName} minimal ${min} karakter`;
  }
  return null;
};

const minValue = (value, min, fieldName) => {
  if (value !== undefined && value !== null && value !== '' && Number(value) < min) {
    return `${fieldName} minimal ${min}`;
  }
  return null;
};

const validate = (data, rules) => {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    for (const entry of validators) {
      const [fn, ...args] = Array.isArray(entry) ? entry : [entry];
      const error = fn(data[field], ...args);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
};

const errorResponse = (res, errors, status = 400) => {
  return res.status(status).json({
    success: false,
    message: 'Validasi gagal',
    errors
  });
};

module.exports = { required, isObjectId, isNumber, isEmail, minLength, minValue, validate, errorResponse };
