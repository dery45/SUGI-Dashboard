export const required = (value, fieldName) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} wajib diisi`;
  }
  return null;
};

export const minLength = (value, min, fieldName) => {
  if (value && String(value).length < min) {
    return `${fieldName} minimal ${min} karakter`;
  }
  return null;
};

export const maxLength = (value, max, fieldName) => {
  if (value && String(value).length > max) {
    return `${fieldName} maksimal ${max} karakter`;
  }
  return null;
};

export const isEmail = (value) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Format email tidak valid';
  }
  return null;
};

export const isPhone = (value) => {
  if (value && !/^[\d\s\-+()]{8,20}$/.test(value)) {
    return 'Format nomor telepon tidak valid';
  }
  return null;
};

export const isNumber = (value, fieldName) => {
  if (value && isNaN(Number(value))) {
    return `${fieldName} harus berupa angka`;
  }
  return null;
};

export const minValue = (value, min, fieldName) => {
  if (value && Number(value) < min) {
    return `${fieldName} minimal ${min}`;
  }
  return null;
};

export const maxValue = (value, max, fieldName) => {
  if (value && Number(value) > max) {
    return `${fieldName} maksimal ${max}`;
  }
  return null;
};

export const isDate = (value) => {
  if (value && isNaN(Date.parse(value))) {
    return 'Format tanggal tidak valid';
  }
  return null;
};

export const compose = (...validators) => (value, fieldName) => {
  for (const validator of validators) {
    const error = validator(value, fieldName);
    if (error) return error;
  }
  return null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  let hasErrors = false;

  for (const [field, validators] of Object.entries(rules)) {
    for (const entry of validators) {
      const [fn, ...args] = Array.isArray(entry) ? entry : [entry];
      const error = fn(data[field], ...args);
      if (error) {
        errors[field] = error;
        hasErrors = true;
        break;
      }
    }
  }

  return { errors, hasErrors };
};
