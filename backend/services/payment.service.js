import crypto from 'crypto';
import env from '../config/env.js';

export async function initializePayment({ email, amount, reference, callbackUrl }) {
  if (!env.paystack.secretKey) {
    console.log(`[payment-mock] Init: N${amount} for ${email} | Ref: ${reference}`);
    return {
      authorization_url: `${env.appUrl}/api/payments/mock-checkout?reference=${reference}`,
      reference
    };
  }
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.paystack.secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount: amount * 100, reference, callback_url: callbackUrl })
  });
  const data = await response.json();
  if (!data.status) throw new Error(data.message || 'Payment init failed');
  return data.data;
}

export async function verifyPayment(reference) {
  if (!env.paystack.secretKey) {
    console.log(`[payment-mock] Verify: ${reference}`);
    return { status: 'success', reference };
  }
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${env.paystack.secretKey}` }
  });
  const data = await response.json();
  if (!data.status) throw new Error(data.message || 'Verification failed');
  return data.data;
}

// Verify webhook signature
export function verifyWebhookSignature(rawBody, signature) {
  if (!env.paystack.secretKey) return true; // Mock mode bypass
  const hash = crypto
    .createHmac('sha512', env.paystack.secretKey)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}
