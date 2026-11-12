export const isString = (v) => typeof v === 'string' && v.trim().length > 0;
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
export const isPhone = (v) => /^[0-9+\-\s]{7,20}$/.test(String(v || ''));

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
      if (!isString(b.password) || b.password.length < 6) return 'New password must be at least 6 characters';
      return null;
    }
  }
};

export default validators;
