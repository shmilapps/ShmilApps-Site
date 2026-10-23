import { createHash, timingSafeEqual } from 'node:crypto';
import { marketResearchProduct as product } from '../lib/server/research-products.js';

// Server-only digests. Never import this file from frontend code or return them in responses.
const couponDigests = ["e67033b5e03937a1fcbdd301e6fd6bcecc20d6042b5758aa0ff60a5e0ddb592b","e171bbe2ee893ef2843ee7341eb629f054d4b9516b1c6cdd9060e17188afaf8f","38c1ced20db7485d687a667eb3b42045e4b04f57f3245782c003f3d5f3197612"];

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(405, { error: 'method_not_allowed' });
  }
  if (Number(req.headers?.['content-length'] || 0) > 2048) return send(413, { error: 'body_too_large' });
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return send(400, { error: 'invalid_json' }); }
  if (body?.service !== product.id || typeof body?.coupon !== 'string' || body.coupon.length > 80) return send(400, { error: 'invalid_request' });
  const normalized = body.coupon.trim().toUpperCase();
  const digest = createHash('sha256').update(normalized).digest();
  const accepted = couponDigests.some(value => timingSafeEqual(digest, Buffer.from(value, 'hex')));
  // A quote is informational. The order server must revalidate the code and compute the charge.
  return send(200, { service: product.id, currency: product.currency, regularAmount: product.regularAmount, amount: accepted ? product.discountedAmount : product.regularAmount, accepted });
}
