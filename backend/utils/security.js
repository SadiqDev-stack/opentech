import { createHash } from 'crypto';

export function hashResetToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}

export function validateCheckoutItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Cart is empty');
  return items.map((item) => {
    const productId = String(item?.productId || '');
    const quantity = Number(item?.quantity);
    if (!/^[a-f\d]{24}$/i.test(productId) || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Cart items must have a valid product and a positive whole-number quantity');
    }
    return { productId, quantity };
  });
}
