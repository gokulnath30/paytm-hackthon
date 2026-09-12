/**
 * Id and number helpers. Firebase forbids `.` `$` `#` `[` `]` and `/` in keys,
 * so every id that becomes a path segment is generated rather than derived from
 * free text — a name-derived key would silently mangle the path.
 */

const HEX = '0123456789ABCDEF'

function hex(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => HEX[b % 16]).join('')
}

export const nowIso = () => new Date().toISOString()

export const orderId = () => `ORD-${hex(12)}`
export const paymentId = () => `PAY-${hex(12)}`
export const saleId = () => `SALE-${hex(12)}`
export const approvalId = () => hex(32).toLowerCase()
export const sessionId = () => crypto.randomUUID()
export const movementId = () => crypto.randomUUID()

const FORBIDDEN = /[.$#[\]/\s]/

export function isSafeKey(value: string): boolean {
  return value.length > 0 && !FORBIDDEN.test(value)
}

/**
 * `PROD-MAGGI-0001` style id built from the product name, skipping any id the
 * caller already holds.
 */
export function productIdFor(name: string, taken: Iterable<string> = []): string {
  const token =
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .split('-')
      .filter(Boolean)
      .slice(0, 2)
      .join('-')
      .slice(0, 16) || 'ITEM'

  const used = new Set(taken)
  for (let n = 1; n <= 9999; n++) {
    const candidate = `PROD-${token}-${String(n).padStart(4, '0')}`
    if (!used.has(candidate)) return candidate
  }
  return `PROD-${token}-${hex(4)}`
}

/** Amounts are stored as JSON numbers rounded to 2dp. */
export const round2 = (value: number) => Math.round(value * 100) / 100
