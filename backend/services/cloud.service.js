import crypto from 'crypto';
import env from '../config/env.js';

export function generateUploadSignature() {
  if (!env.cloudinary.apiSecret || !env.cloudinary.apiKey || !env.cloudinary.cloudName) {
    throw new Error('Cloudinary not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'opentech';
  const allowedFormats = 'jpg,png,jpeg,pdf';
  
  // Sign the fixed folder and permitted upload formats.
  const strToSign = `allowed_formats=${allowedFormats}&folder=${folder}&timestamp=${timestamp}${env.cloudinary.apiSecret}`;
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

  return {
    timestamp,
    signature,
    folder,
    allowedFormats,
    apiKey: env.cloudinary.apiKey,
    cloudName: env.cloudinary.cloudName
  };
}
