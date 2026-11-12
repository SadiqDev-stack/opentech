import crypto from 'crypto';
import env from '../config/env.js';

export function generateUploadSignature() {
  if (!env.cloudinary.apiSecret) {
    throw new Error('Cloudinary not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'opentech';
  
  // Create signature
  const strToSign = `folder=${folder}&timestamp=${timestamp}${env.cloudinary.apiSecret}`;
  const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

  return {
    timestamp,
    signature,
    folder,
    apiKey: env.cloudinary.apiKey,
    cloudName: env.cloudinary.cloudName
  };
}
