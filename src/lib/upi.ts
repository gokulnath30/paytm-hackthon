/**
 * Builds a UPI deep-link string in the standard `upi://pay` intent format that
 * any UPI app can scan. This is a simulated merchant VPA for the prototype —
 * there is no real Paytm merchant account behind it.
 */
export function buildUpiUri(opts: { amount: number; billId: string; payeeName?: string }): string {
  const params = new URLSearchParams({
    pa: 'kiranastore@paytm',
    pn: opts.payeeName ?? 'Kirana Store',
    am: opts.amount.toFixed(2),
    cu: 'INR',
    tn: `Bill ${opts.billId}`,
    tr: opts.billId,
  })
  return `upi://pay?${params.toString()}`
}
