import { catalog, categories } from '../mockData'
import type { CartItem, CatalogItem, Category, Product, StockState } from '../mockData'
import { round2 } from './ids'
import type { OrderItemRecord, OrderRecord, ProductRecord } from './types'

/**
 * Database records in, screen props out. The screens keep the shapes they were
 * built against (`mockData.ts`), so integration never reached into a component.
 */

/* ---------- thumbnails ----------
 * Product photography is optional in the schema (`image` is usually null), so
 * until it arrives every row still needs a glyph. Names the prototype already
 * knows keep their emoji; everything else falls back to its category. */

const BY_NAME = new Map(catalog.map((c) => [c.name.toLowerCase(), c.thumb]))
const BY_CATEGORY = new Map(categories.map((c) => [c.label.toLowerCase(), c.thumb]))

const KEYWORDS: Array<[RegExp, string]> = [
  [/milk|dairy|curd|dahi/i, '🥛'],
  [/butter|ghee|cheese|paneer/i, '🧈'],
  [/bread|bun|rusk|bakery/i, '🍞'],
  [/biscuit|cookie|oreo/i, '🍪'],
  [/noodle|maggi|pasta/i, '🍜'],
  [/chips|namkeen|bhujia|snack/i, '🍟'],
  [/cola|coke|pepsi|soda|drink|juice|beverage/i, '🥤'],
  [/tea|chai|coffee/i, '☕'],
  [/rice|atta|flour|wheat|staple/i, '🌾'],
  [/oil|refined/i, '🫒'],
  [/salt|sugar|masala|spice/i, '🧂'],
  [/soap|shampoo|detergent|clean/i, '🧴'],
  [/egg/i, '🥚'],
  [/chocolate|candy|sweet/i, '🍫'],
]

export function thumbFor(name: string, category?: string | null): string {
  const known = BY_NAME.get(name.trim().toLowerCase())
  if (known) return known

  const byCategory = category ? BY_CATEGORY.get(category.trim().toLowerCase()) : undefined
  if (byCategory) return byCategory

  const haystack = `${name} ${category ?? ''}`
  for (const [pattern, emoji] of KEYWORDS) if (pattern.test(haystack)) return emoji
  return '🛒'
}

export const categorySlug = (label: string) =>
  label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other'

/* ---------- products ---------- */

/** Default when the record omits it: 20% of stock on hand, floor of 1. */
const minimumStock = (record: ProductRecord) =>
  record.minimum_stock ?? Math.max(1, Math.round(record.current_stock * 0.2))

export function stockState(stock: number, minimum: number): StockState {
  if (stock <= 0) return 'out'
  return stock <= minimum ? 'low' : 'in-stock'
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function toProduct(record: ProductRecord): Product {
  const minStock = minimumStock(record)
  return {
    id: record.product_id,
    name: record.name,
    packSize: record.pack_size ?? '',
    brand: record.brand ?? '—',
    category: record.category ?? 'General',
    thumb: thumbFor(record.name, record.category),
    stock: record.current_stock,
    sellingPrice: record.selling_price,
    purchasePrice: record.purchase_price,
    minStock,
    supplier: record.supplier ?? '—',
    addedOn: formatDate(record.created_at),
    state: stockState(record.current_stock, minStock),
  }
}

export function toCatalogItem(record: ProductRecord): CatalogItem {
  return {
    id: record.product_id,
    name: record.name,
    packSize: record.pack_size ?? '',
    thumb: thumbFor(record.name, record.category),
    categoryId: categorySlug(record.category ?? 'General'),
    price: record.selling_price,
    stockLeft: record.current_stock,
    minStock: minimumStock(record),
  }
}

/** Category rail built from whatever the catalogue actually contains. */
export function toCategories(records: ProductRecord[]): Category[] {
  const seen = new Map<string, Category>()
  for (const record of records) {
    const label = (record.category ?? 'General').trim() || 'General'
    const id = categorySlug(label)
    if (!seen.has(id)) seen.set(id, { id, label, thumb: BY_CATEGORY.get(label.toLowerCase()) ?? thumbFor(label, label) })
  }
  return [
    { id: 'all', label: 'All', thumb: '🧺' },
    ...[...seen.values()].sort((a, b) => a.label.localeCompare(b.label)),
  ]
}

/* ---------- cart ↔ order ---------- */

export function toOrderItems(cart: CartItem[]): OrderItemRecord[] {
  return cart.map((item) => ({
    product_id: item.productId,
    name: item.name,
    quantity: item.qty,
    selling_price: item.unitPrice,
    line_total: round2(item.unitPrice * item.qty),
  }))
}

export function toCart(order: OrderRecord): CartItem[] {
  return order.items.map((item) => ({
    productId: item.product_id,
    name: item.name,
    packSize: '',
    thumb: thumbFor(item.name),
    unitPrice: item.selling_price,
    qty: item.quantity,
  }))
}

/** Form draft → product record, for Add Product. */
export function toProductRecord(input: {
  productId: string
  name: string
  brand?: string
  category?: string
  packSize?: string
  purchasePrice: number
  sellingPrice: number
  stock: number
  minStock?: number
  supplier?: string
}): ProductRecord {
  return {
    product_id: input.productId,
    name: input.name.trim(),
    brand: input.brand?.trim() || null,
    category: input.category?.trim() || null,
    pack_size: input.packSize?.trim() || null,
    image: null,
    purchase_price: round2(input.purchasePrice),
    selling_price: round2(input.sellingPrice),
    current_stock: Math.trunc(input.stock),
    minimum_stock: input.minStock ?? Math.max(1, Math.round(input.stock * 0.2)),
    supplier: input.supplier?.trim() || null,
  }
}
