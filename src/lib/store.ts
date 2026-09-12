import type { Bill, ChatMessage, Payment, Product } from './types'

const KEYS = {
  products: 'kirana.products.v1',
  bills: 'kirana.bills.v1',
  payments: 'kirana.payments.v1',
  chat: 'kirana.chat.v1',
  seeded: 'kirana.seeded.v1',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

// ---------- Products ----------

export function getProducts(): Product[] {
  return read<Product[]>(KEYS.products, [])
}

function saveProducts(products: Product[]) {
  write(KEYS.products, products)
}

export function addProduct(input: {
  name: string
  brand?: string
  category?: string
  price: number
  stock: number
}): Product {
  const product: Product = {
    id: uid('prod'),
    name: input.name,
    brand: input.brand?.trim() || input.name,
    category: input.category?.trim() || 'General',
    price: input.price,
    stock: input.stock,
    createdAt: Date.now(),
  }
  const products = getProducts()
  products.unshift(product)
  saveProducts(products)
  return product
}

/**
 * Adds a product via voice/manual entry. If a product with the same name
 * already exists, this restocks it (adds qty, updates price) instead of
 * creating a duplicate catalog entry.
 */
export function upsertProductByVoice(input: {
  name: string
  brand?: string
  category?: string
  price: number
  qty: number
}): { product: Product; restocked: boolean } {
  const products = getProducts()
  const idx = products.findIndex((p) => p.name.toLowerCase() === input.name.trim().toLowerCase())
  if (idx >= 0) {
    products[idx] = {
      ...products[idx],
      price: input.price,
      stock: products[idx].stock + input.qty,
      brand: input.brand?.trim() || products[idx].brand,
      category: input.category?.trim() || products[idx].category,
    }
    saveProducts(products)
    return { product: products[idx], restocked: true }
  }
  const product = addProduct({ name: input.name, brand: input.brand, category: input.category, price: input.price, stock: input.qty })
  return { product, restocked: false }
}

export function adjustStock(productId: string, delta: number) {
  const products = getProducts()
  const idx = products.findIndex((p) => p.id === productId)
  if (idx >= 0) {
    products[idx] = { ...products[idx], stock: Math.max(0, products[idx].stock + delta) }
    saveProducts(products)
  }
}

export function restockProduct(productId: string, addQty: number) {
  adjustStock(productId, Math.abs(addQty))
}

/** Loose match: exact name, then substring either direction. */
export function findProduct(query: string): Product | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined
  const products = getProducts()
  return (
    products.find((p) => p.name.toLowerCase() === q) ??
    products.find((p) => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()))
  )
}

// ---------- Bills ----------

export function getBills(): Bill[] {
  return read<Bill[]>(KEYS.bills, [])
}

function saveBills(bills: Bill[]) {
  write(KEYS.bills, bills)
}

export function addBill(input: { items: Bill['items']; amount: number; createdAt?: number; status?: Bill['status'] }): Bill {
  const bill: Bill = {
    id: uid('bill'),
    items: input.items,
    amount: input.amount,
    status: input.status ?? 'pending',
    createdAt: input.createdAt ?? Date.now(),
  }
  const bills = getBills()
  bills.unshift(bill)
  saveBills(bills)
  return bill
}

export function getBill(id: string): Bill | undefined {
  return getBills().find((b) => b.id === id)
}

export function updateBill(id: string, patch: Partial<Bill>): Bill | undefined {
  const bills = getBills()
  const idx = bills.findIndex((b) => b.id === id)
  if (idx < 0) return undefined
  bills[idx] = { ...bills[idx], ...patch }
  saveBills(bills)
  return bills[idx]
}

export function getPendingBills(): Bill[] {
  return getBills().filter((b) => b.status === 'pending')
}

/** Best pending bill matching a received amount, most recent first. */
export function findMatchingBill(amount: number, windowMs = 1000 * 60 * 60 * 24): Bill | undefined {
  const now = Date.now()
  return getPendingBills()
    .filter((b) => Math.abs(b.amount - amount) < 0.5 && now - b.createdAt < windowMs)
    .sort((a, b) => b.createdAt - a.createdAt)[0]
}

// ---------- Payments ----------

export function getPayments(): Payment[] {
  return read<Payment[]>(KEYS.payments, [])
}

function savePayments(payments: Payment[]) {
  write(KEYS.payments, payments)
}

export function addPayment(input: { amount: number; source?: string; matchedBillId?: string; createdAt?: number }): Payment {
  const payment: Payment = {
    id: uid('pay'),
    amount: input.amount,
    method: 'UPI',
    source: input.source ?? 'Customer UPI',
    matchedBillId: input.matchedBillId,
    createdAt: input.createdAt ?? Date.now(),
  }
  const payments = getPayments()
  payments.unshift(payment)
  savePayments(payments)
  return payment
}

export function getPayment(id: string): Payment | undefined {
  return getPayments().find((p) => p.id === id)
}

export function attachPaymentToBill(paymentId: string, billId: string) {
  const payments = getPayments()
  const idx = payments.findIndex((p) => p.id === paymentId)
  if (idx >= 0) {
    payments[idx] = { ...payments[idx], matchedBillId: billId }
    savePayments(payments)
  }
}

/**
 * Tries to auto-match a payment to a pending bill of the same amount. On a
 * match: marks the bill paid, decrements stock for every line item, and
 * links payment <-> bill both ways. Returns the paid bill, or undefined if
 * no pending bill matches (caller should route to the "ask merchant" flow).
 */
export function reconcilePayment(paymentId: string): Bill | undefined {
  const payment = getPayment(paymentId)
  if (!payment) return undefined
  if (payment.matchedBillId) return getBill(payment.matchedBillId)

  const bill = findMatchingBill(payment.amount)
  if (!bill) return undefined

  updateBill(bill.id, { status: 'paid', paymentId: payment.id, paidAt: Date.now() })
  attachPaymentToBill(payment.id, bill.id)
  for (const item of bill.items) adjustStock(item.productId, -item.qty)
  return getBill(bill.id)
}

/** Manually tags an untagged payment (no matching bill) with items the merchant confirms. */
export function confirmUntaggedPayment(paymentId: string, items: Bill['items']): Bill | undefined {
  const payment = getPayment(paymentId)
  if (!payment) return undefined

  const bill = addBill({ items, amount: payment.amount, status: 'paid' })
  updateBill(bill.id, { paidAt: Date.now(), paymentId: payment.id })
  attachPaymentToBill(payment.id, bill.id)
  for (const item of items) adjustStock(item.productId, -item.qty)
  return getBill(bill.id)
}

// ---------- Chat ----------

export function getChatMessages(): ChatMessage[] {
  return read<ChatMessage[]>(KEYS.chat, [])
}

export function addChatMessage(role: ChatMessage['role'], text: string): ChatMessage {
  const message: ChatMessage = { id: uid('msg'), role, text, createdAt: Date.now() }
  const messages = getChatMessages()
  messages.push(message)
  write(KEYS.chat, messages)
  return message
}

// ---------- Insights ----------

export function getSoldCounts(days = 7): Record<string, { name: string; qty: number }> {
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  const counts: Record<string, { name: string; qty: number }> = {}
  for (const bill of getBills()) {
    if (bill.status !== 'paid' || bill.createdAt < since) continue
    for (const item of bill.items) {
      const entry = counts[item.productId] ?? { name: item.name, qty: 0 }
      entry.qty += item.qty
      counts[item.productId] = entry
    }
  }
  return counts
}

export function getTopSellers(days = 7, limit = 5): { productId: string; name: string; qty: number }[] {
  const counts = getSoldCounts(days)
  return Object.entries(counts)
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit)
}

export function getLowStock(threshold = 5): Product[] {
  return getProducts()
    .filter((p) => p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock)
}

// ---------- Demo seeding ----------

function daysAgo(n: number): number {
  return Date.now() - n * 24 * 60 * 60 * 1000
}

export function ensureSeeded() {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(KEYS.seeded)) return

  const maggi = addProduct({ name: 'Maggi', brand: 'Nestle', category: 'Instant Noodles', price: 20, stock: 3 })
  const parleG = addProduct({ name: 'Parle-G', brand: 'Parle', category: 'Biscuits', price: 20, stock: 22 })
  const bisleri = addProduct({ name: 'Bisleri Water', brand: 'Bisleri', category: 'Beverages', price: 20, stock: 30 })
  addProduct({ name: 'Amul Milk', brand: 'Amul', category: 'Dairy', price: 28, stock: 18 })
  addProduct({ name: 'Tata Salt', brand: 'Tata', category: 'Grocery', price: 22, stock: 40 })

  const line = (p: Product, qty: number) => ({ productId: p.id, name: p.name, price: p.price, qty })

  const historicalBills: { items: Bill['items']; createdAt: number }[] = [
    { createdAt: daysAgo(5), items: [line(maggi, 6), line(parleG, 6), line(bisleri, 4)] },
    { createdAt: daysAgo(3), items: [line(maggi, 5), line(bisleri, 3)] },
    { createdAt: daysAgo(2), items: [line(maggi, 4), line(parleG, 2)] },
    { createdAt: daysAgo(1), items: [line(maggi, 3), line(parleG, 4), line(bisleri, 2)] },
  ]

  for (const h of historicalBills) {
    const amount = h.items.reduce((sum, it) => sum + it.price * it.qty, 0)
    const bill = addBill({ items: h.items, amount, createdAt: h.createdAt, status: 'paid' })
    const payment = addPayment({ amount, source: 'Customer UPI', createdAt: h.createdAt + 60_000 })
    attachPaymentToBill(payment.id, bill.id)
    updateBill(bill.id, { paymentId: payment.id, paidAt: h.createdAt + 60_000 })
  }

  addChatMessage('assistant', 'Namaste! I\'m your AI store assistant. You can speak or type to manage your store.')

  localStorage.setItem(KEYS.seeded, '1')
}

export function resetDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  ensureSeeded()
}
