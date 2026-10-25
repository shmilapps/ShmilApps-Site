// SUMIT sends OG-* keys with capitals. Accept case variants, but reject
// duplicate aliases so different parsers cannot verify different values.
export function paymentReturnParams(searchParams) {
  const one = name => {
    const values = [...searchParams].filter(([key]) => key.toLowerCase() === name);
    return values.length === 1 ? values[0][1] : null;
  };
  const rawId = one('og-paymentid');
  return {paymentId:/^[1-9]\d{0,14}$/.test(rawId || '') ? Number(rawId) : 0,reference:one('og-externalidentifier')};
}