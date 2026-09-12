export interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  stock: number
  createdAt: number
}

export interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
}

export type BillStatus = 'pending' | 'paid'

export interface Bill {
  id: string
  items: CartItem[]
  amount: number
  status: BillStatus
  createdAt: number
  paidAt?: number
  paymentId?: string
}

export interface Payment {
  id: string
  amount: number
  createdAt: number
  method: 'UPI'
  source: string
  matchedBillId?: string
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  createdAt: number
}

export type VoiceLang = 'en-IN' | 'hi-IN' | 'ta-IN'
