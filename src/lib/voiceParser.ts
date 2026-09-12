/**
 * Parses the Hindi/Tamil/English code-switched merchant utterances shown in the
 * product spec, e.g. "Das Maggi, bees rupay" or "2 Maggi, 1 Parle-G".
 */

const NUMBER_WORDS: Record<string, number> = {
  // Hindi
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, che: 6,
  saat: 7, aath: 8, nau: 9, das: 10, dus: 10,
  gyarah: 11, barah: 12, baarah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16,
  satrah: 17, atharah: 18, unnees: 19,
  bees: 20, bis: 20, tees: 30, chalis: 40, pachas: 50, pachaas: 50, saath: 60,
  sattar: 70, assi: 80, nabbe: 90, sau: 100,
  // Tamil (common transliterations)
  onnu: 1, rendu: 2, moonu: 3, naalu: 4, anju: 5, aaru: 6, elu: 7, ettu: 8,
  onbadhu: 9, pathu: 10, irupathu: 20, muppathu: 30,
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100,
}

function wordOrDigitToNumber(token: string): number | null {
  const clean = token.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!clean) return null
  if (/^\d+$/.test(clean)) return parseInt(clean, 10)
  return NUMBER_WORDS[clean] ?? null
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) =>
      w
        .split('-')
        .map((p) => (p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : p))
        .join('-'),
    )
    .join(' ')
}

export interface ParsedProductUtterance {
  name: string
  qty: number
  price: number
}

/** "Das Maggi, bees rupay" -> { name: "Maggi", qty: 10, price: 20 } */
export function parseAddProductUtterance(raw: string): ParsedProductUtterance | null {
  const text = raw.trim()
  if (!text) return null

  const parts = text.split(',')
  let qtyPart = parts[0]?.trim() ?? ''
  let pricePart = parts.slice(1).join(',').trim()

  if (!pricePart) {
    const m = text.match(/(.*?)\b(\d+|[a-z]+)\s*(rupay\w*|rupees?|rs\.?)\b(.*)$/i)
    if (m) {
      qtyPart = m[1]
      pricePart = `${m[2]} ${m[3]}`
    }
  }

  const qtyTokens = qtyPart.split(/\s+/).filter(Boolean)
  let qty: number | null = null
  const nameTokens: string[] = []
  for (const t of qtyTokens) {
    if (qty === null) {
      const n = wordOrDigitToNumber(t)
      if (n !== null) {
        qty = n
        continue
      }
    }
    nameTokens.push(t)
  }
  const name = nameTokens
    .join(' ')
    .replace(/[^\w\s-]/g, '')
    .trim()

  const priceTokens = pricePart.split(/\s+/).filter(Boolean)
  let price: number | null = null
  for (const t of priceTokens) {
    const n = wordOrDigitToNumber(t)
    if (n !== null) {
      price = n
      break
    }
  }

  if (!name || qty === null || price === null) return null
  return { name: titleCase(name), qty, price }
}

export interface ParsedCartLine {
  name: string
  qty: number
}

/** "2 Maggi, 1 Parle-G" -> [{name:"Maggi",qty:2},{name:"Parle-G",qty:1}] */
export function parseCartUtterance(raw: string): ParsedCartLine[] {
  const text = raw.trim()
  if (!text) return []

  const segments = text
    .split(/,|\band\b|\baur\b/i)
    .map((s) => s.trim())
    .filter(Boolean)

  const lines: ParsedCartLine[] = []
  for (const seg of segments) {
    const tokens = seg.split(/\s+/).filter(Boolean)
    let qty: number | null = null
    const nameTokens: string[] = []
    for (const t of tokens) {
      if (qty === null) {
        const n = wordOrDigitToNumber(t)
        if (n !== null) {
          qty = n
          continue
        }
      }
      nameTokens.push(t)
    }
    const name = nameTokens
      .join(' ')
      .replace(/[^\w\s-]/g, '')
      .trim()
    if (name) lines.push({ name: titleCase(name), qty: qty ?? 1 })
  }
  return lines
}
