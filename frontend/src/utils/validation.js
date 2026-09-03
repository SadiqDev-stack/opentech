/** Tiny validation helpers so forms stay readable without a form library. */

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isPhone(value) {
  return /^(\+234|0)[789]\d{9}$/.test(String(value || "").replace(/\s/g, ""));
}

export function required(value, label) {
  if (!String(value ?? "").trim()) return `${label} is required`;
  return "";
}

export function maxLength(value, limit, label) {
  if (String(value ?? "").length > limit) return `${label} must be under ${limit} characters`;
  return "";
}

/** Runs a rules object: { field: (value, values) => errorString }. */
export function validate(values, rules) {
  const errors = {};
  Object.keys(rules).forEach((field) => {
    const message = rules[field](values[field], values);
    if (message) errors[field] = message;
  });
  return errors;
}
