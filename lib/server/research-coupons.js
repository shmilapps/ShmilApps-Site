import { createHash, timingSafeEqual } from 'node:crypto';
import { marketResearchProduct as product } from './research-products.js';

const testDigest = 'a86111f7cb4b9343673d3f460079410c4001056374db03326c08893adb694586';
const digests = ['e67033b5e03937a1fcbdd301e6fd6bcecc20d6042b5758aa0ff60a5e0ddb592b','e171bbe2ee893ef2843ee7341eb629f054d4b9516b1c6cdd9060e17188afaf8f','38c1ced20db7485d687a667eb3b42045e4b04f57f3245782c003f3d5f3197612'];

export function researchQuote(coupon) {
  if (typeof coupon !== 'string' || coupon.length > 80) throw new Error('invalid_coupon');
  const hash = createHash('sha256').update(coupon.trim().toUpperCase()).digest();
  const isTest = timingSafeEqual(hash, Buffer.from(testDigest, 'hex'));
  const accepted = isTest || digests.some(value => timingSafeEqual(hash, Buffer.from(value, 'hex')));
  if (coupon.trim() && !accepted) throw new Error('invalid_coupon');
  return { accepted, isTest, amount: isTest ? product.testAmount : accepted ? product.discountedAmount : product.regularAmount };
}
