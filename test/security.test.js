import test from 'node:test';
import assert from 'node:assert/strict';
import { hashResetToken, validateCheckoutItems } from '../backend/utils/security.js';

test('password reset tokens are stored as one-way SHA-256 digests', () => {
  const token = 'one-time-reset-token';
  const digest = hashResetToken(token);
  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.notEqual(digest, token);
  assert.equal(hashResetToken(token), digest);
});

test('checkout accepts a valid 24-character product id and positive integer quantity', () => {
  assert.deepEqual(validateCheckoutItems([{ productId: '0123456789abcdef01234567', quantity: 2 }]), [{ productId: '0123456789abcdef01234567', quantity: 2 }]);
});

test('checkout rejects missing carts and non-positive or fractional quantities', () => {
  assert.throws(() => validateCheckoutItems([]), /Cart is empty/);
  assert.throws(() => validateCheckoutItems([{ productId: '0123456789abcdef01234567', quantity: 0 }]), /positive whole-number quantity/);
  assert.throws(() => validateCheckoutItems([{ productId: '0123456789abcdef01234567', quantity: 1.5 }]), /positive whole-number quantity/);
});
