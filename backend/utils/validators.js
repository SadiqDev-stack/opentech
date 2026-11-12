// Validation rules grouped by feature.
// Each rule is a plain function (body) => string | null.
// Return a message string for invalid input, or null for valid.

export const isString = (v) => typeof v === 'string' && v.trim().length > 0;
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
export const isPhone = (v) => /^[0-9+\-\s]{7,20}$/.test(String(v || ''));
export const isNumber = (v) => v !== undefined && v !== null && !Number.isNaN(Number(v));
export const isUrl = (v) => /^https?:\/\/.+/.test(String(v || ''));
export const isMongoId = (v) => /^[a-fA-F0-9]{24}$/.test(String(v || ''));

const validators = {
  auth: {
    register: (b) => {
      if (!isString(b.fullName)) return 'Full name is required';
      if (!isEmail(b.email)) return 'A valid email is required';
      if (!isPhone(b.phone)) return 'A valid phone number is required';
      if (!isString(b.password) || b.password.length < 6) return 'Password must be at least 6 characters';
      return null;
    },
    login: (b) => {
      if (!isEmail(b.email)) return 'A valid email is required';
      if (!isString(b.password)) return 'Password is required';
      return null;
    },
    forgotPassword: (b) => {
      if (!isEmail(b.email)) return 'A valid email is required';
      return null;
    },
    resetPassword: (b) => {
      if (!isString(b.token)) return 'Reset token is required';
      if (!isString(b.password) || b.password.length < 6) return 'Password must be at least 6 characters';
      return null;
    }
  }
};

export default validators;
