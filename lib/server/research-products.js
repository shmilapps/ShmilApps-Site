// Server-only product settings. Never import into components or browser code.
export const marketResearchProduct = Object.freeze({
  id: 'market-research-full',
  currency: 'ILS',
  regularAmount: 99,
  discountedAmount: 69,
  paymentUrls: Object.freeze({
    regular: 'https://pay.sumit.co.il/15ajtmv/15cgqv4/15cgqv6/payment/',
    discounted: 'https://pay.sumit.co.il/15ajtmv/15cgqv4/15em78t/payment/',
  }),
});

// These links are configuration only. Release a payment URL only after an order
// and its document are persisted and a verified provider/order mapping exists.
