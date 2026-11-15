import crypto from 'crypto';
import env from '../config/env.js';
import Setting from '../models/Setting.js';

export async function generateUploadSignature() {
  const dbSetting = await Setting.findOne().lean().catch(() => null);
  const apiSecret = dbSetting?.cloudinaryApiSecret || env.cloudinary.apiSecret;
  const apiKey = dbSetting?.cloudinaryApiKey || env.cloudinary.apiKey;
  const cloudName = dbSetting?.cloudinaryCloudName || env.cloudinary.cloudName;
  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error('Cloudinary not configured');
  }
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
    apiKey,
    cloudName: env.cloudinary.cloudName
  };
}
