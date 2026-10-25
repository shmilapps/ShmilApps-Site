// Server-only product settings. Never import into components or browser code.
export const marketResearchProduct = Object.freeze({
  id: 'market-research-full',
  currency: 'ILS',
  regularAmount: 99,
  discountedAmount: 69,
  testAmount: 5,
  paymentUrls: Object.freeze({
    test: 'https://pay.sumit.co.il/15ajtmv/15er2an/15er2ao/payment/',
    regular: 'https://pay.sumit.co.il/15ajtmv/15em4nx/15em4qr/payment/',
    discounted: 'https://pay.sumit.co.il/15ajtmv/15cgqv4/15em78t/payment/',
  }),
});

// Hosted checkout links are released only after private order/document storage.
// Payment is confirmed only by server-side SUMIT verification and the atomic RPC.
