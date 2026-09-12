/** Display helpers. Amounts are rupees; the app never shows paise. */

export const inr = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`

export const count = (value: number) => value.toLocaleString('en-IN')

/** "12%" for a rise, "−4%" for a fall, nothing when there is no baseline. */
export function percent(value?: number): string | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined
  return `${value < 0 ? '−' : ''}${Math.abs(value)}%`
}

export const direction = (value?: number): 'up' | 'down' => (value !== undefined && value < 0 ? 'down' : 'up')
