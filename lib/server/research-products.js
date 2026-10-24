// Server-only product settings. Never import into components or browser code.
export const marketResearchProduct = Object.freeze({
  id: 'market-research-full',
  currency: 'ILS',
  regularAmount: 99,
  discountedAmount: 69,
  paymentUrls: Object.freeze({
    regular: 'https://pay.sumit.co.il/15ajtmv/15em4nx/15em4qr/payment/',
    discounted: 'https://pay.sumit.co.il/15ajtmv/15cgqv4/15em78t/payment/',
  }),
});

// Temporary checkout links are released only after private order/document storage.
// Payment status remains pending until manually verified; no automatic confirmation.
