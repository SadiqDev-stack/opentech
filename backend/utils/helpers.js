import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);

export const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 10; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const randomId = (prefix, length = 6) => {
  const digits = '0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) out += digits[Math.floor(Math.random() * digits.length)];
  return `${prefix}-${out}`;
};

export const generateOrderNumber = () => randomId('OPT');
export const generateRequestNumber = () => randomId('REQ');
export const generateReportNumber = () => randomId('REP');

export const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
    .format(Number(amount) || 0)
    .replace('NGN', '₦')
    .trim();

export const sanitizeString = (value) => String(value || '').replace(/\s+/g, ' ').trim();

export const signToken = (payload, expiresIn = env.jwtExpiresIn) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
