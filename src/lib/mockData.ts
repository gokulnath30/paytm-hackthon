/**
 * Every value shown in the UI lives here, typed and in one place, so wiring the
 * Phinite AI API later means replacing these exports with fetch calls and
 * leaving the screens untouched.
 */

export type StockState = 'in-stock' | 'low' | 'out'

export interface Product {
  id: string
  name: string
  packSize: string
  brand: string
  category: string
  thumb: string
  stock: number
  sellingPrice: number
  purchasePrice: number
  minStock: number
  supplier: string
  addedOn: string
  state: StockState
}

export interface CartItem {
  productId: string
  name: string
  packSize: string
  thumb: string
  unitPrice: number
  qty: number
}

export interface ChatMessage {
  id: string
  from: 'user' | 'agent'
  text?: string
  /** Product confirmation card rendered inside the Store Manager thread. */
  productCard?: {
    name: string
    packSize: string
    brand: string
    category: string
    thumb: string
    status: string
    time: string
  }
  /** Bulleted suggestions the agent offers. */
  bullets?: string[]
}

export const store = {
  name: 'Sharma Kirana Store',
  ownerGreeting: 'Good Morning, Sharma ji!',
  greetingSub: 'Your store is doing great today.',
}

export const dashboardStats = [
  { id: 'sales', label: "Today's Sales", value: '₹5,420', delta: '12%', trend: 'up' as const },
  { id: 'profit', label: 'Est. Profit', value: '₹1,820', delta: '8%', trend: 'up' as const },
]

export const dashboardCounts = [
  { id: 'customers', label: 'Customers', value: '48' },
  { id: 'low-stock', label: 'Low Stock Items', value: '12' },
]

export const agents = [
  {
    id: 'store-manager',
    name: 'Store Manager',
    fullName: 'Store Manager AI',
    shortDesc: 'Manage products, stock, insights',
    longDesc: 'Add or update products, manage inventory, check sales and get business insights.',
    route: '/chat/store-manager',
    tone: 'brand' as const,
  },
  {
    id: 'sales-billing',
    name: 'Sales & Billing',
    fullName: 'Sales & Billing AI',
    shortDesc: 'Create bills, handle payments',
    longDesc: 'Listen to customers, create bills, handle payments and update stock automatically.',
    route: '/chat/sales',
    tone: 'leaf' as const,
  },
]

export const agentTagline = 'Two AI agents. One smarter store.'

export const products: Product[] = [
  {
    id: 'maggi',
    name: 'Maggi 2-Minute Noodles',
    packSize: '70g',
    brand: 'Nestlé',
    category: 'Noodles',
    thumb: '🍜',
    stock: 20,
    sellingPrice: 20,
    purchasePrice: 12,
    minStock: 5,
    supplier: 'Local Distributor',
    addedOn: '12 Sep 2025',
    state: 'in-stock',
  },
  {
    id: 'amul-milk',
    name: 'Amul Taaza Milk',
    packSize: '500ml',
    brand: 'Amul',
    category: 'Dairy',
    thumb: '🥛',
    stock: 18,
    sellingPrice: 30,
    purchasePrice: 24,
    minStock: 5,
    supplier: 'Local Distributor',
    addedOn: '12 Sep 2025',
    state: 'in-stock',
  },
  {
    id: 'parle-g',
    name: 'Parle-G Biscuits',
    packSize: '100g',
    brand: 'Parle',
    category: 'Biscuits',
    thumb: '🍪',
    stock: 50,
    sellingPrice: 10,
    purchasePrice: 7,
    minStock: 10,
    supplier: 'Local Distributor',
    addedOn: '12 Sep 2025',
    state: 'in-stock',
  },
  {
    id: 'britannia-bread',
    name: 'Britannia Bread',
    packSize: '400g',
    brand: 'Britannia',
    category: 'Bakery',
    thumb: '🍞',
    stock: 3,
    sellingPrice: 40,
    purchasePrice: 32,
    minStock: 5,
    supplier: 'Local Distributor',
    addedOn: '12 Sep 2025',
    state: 'low',
  },
  {
    id: 'amul-butter',
    name: 'Amul Butter',
    packSize: '100g',
    brand: 'Amul',
    category: 'Dairy',
    thumb: '🧈',
    stock: 5,
    sellingPrice: 58,
    purchasePrice: 48,
    minStock: 6,
    supplier: 'Local Distributor',
    addedOn: '12 Sep 2025',
    state: 'low',
  },
  {
    id: 'coke',
    name: 'Coke 500ml',
    packSize: '500ml',
    brand: 'Coca-Cola',
    category: 'Beverages',
    thumb: '🥤',
    stock: 4,
    sellingPrice: 40,
    purchasePrice: 32,
    minStock: 6,
    supplier: 'Local Distributor',
    addedOn: '12 Sep 2025',
    state: 'low',
  },
]

export const inventoryFilters = [
  { id: 'all', label: 'All', count: 32 },
  { id: 'in-stock', label: 'In Stock', count: 26 },
  { id: 'low', label: 'Low Stock', count: 6 },
  { id: 'out', label: 'Out of Stock', count: null },
]

export const storeManagerThread: ChatMessage[] = [
  {
    id: 'm1',
    from: 'user',
    text: 'Add 20 Maggi packets, I bought each for 12 rupees and sell them for 20.',
  },
  {
    id: 'm2',
    from: 'agent',
    text: 'I found Maggi 2-Minute Noodles (70g).\n\nAdding 20 packets at a purchase price of ₹12 and selling price of ₹20.',
    productCard: {
      name: 'Maggi 2-Minute Noodles',
      packSize: '70g',
      brand: 'Nestlé',
      category: 'Noodles',
      thumb: '🍜',
      status: 'Added to inventory',
      time: '10:24 AM',
    },
  },
  {
    id: 'm3',
    from: 'agent',
    text: 'You can ask me:',
    bullets: ['Show current stock', 'Change price', 'What sold the most?'],
  },
]

export const addProductVoice = {
  title: 'Add Product',
  subtitle: "Just speak. I'll take care of the rest.",
  listeningLabel: 'Listening...',
  tipLabel: 'Tip: Try saying',
  tipExample: '"Add 10 Parle-G, bought for 5 sell for 10"',
}

export const salesSession = {
  customer: 'Customer #104',
  badge: 'New',
  customerLine: 'Bhaiya, two milk packets and one bread.',
  agentLine: 'Adding 2 × Amul Milk and 1 × Britannia Bread to the cart.',
}

export const initialCart: CartItem[] = [
  { productId: 'amul-milk', name: 'Amul Taaza Milk', packSize: '500ml', thumb: '🥛', unitPrice: 30, qty: 2 },
  { productId: 'britannia-bread', name: 'Britannia Bread', packSize: '400g', thumb: '🍞', unitPrice: 40, qty: 1 },
]

export const payment = {
  customer: 'Customer #104',
  orderId: 'Order #104',
  methods: ['UPI', 'RuPay', 'Cards', 'Wallet'],
  waitingLabel: 'Waiting for payment...',
  waitingSub: 'Payment will be detected automatically.',
  successTitle: 'Payment Successful!',
  inventoryNote: 'Inventory updated automatically',
}

export const insightsRanges = ['Today', 'This Week', 'This Month']

export const insightsTabs = ['Overview', 'Products', 'Customers', 'Inventory']

export const insightsStats = [
  { id: 'total-sales', label: 'Total Sales', value: '₹5,420', delta: '12%' },
  { id: 'est-profit', label: 'Est. Profit', value: '₹1,820', delta: '8%' },
  { id: 'customers', label: 'Customers', value: '48', delta: '20%' },
  { id: 'items-sold', label: 'Items Sold', value: '127', delta: '15%' },
]

export const topSelling = [
  { rank: 1, name: 'Maggi 2-Minute Noodles', thumb: '🍜', units: 42 },
  { rank: 2, name: 'Amul Taaza Milk', thumb: '🥛', units: 36 },
  { rank: 3, name: 'Parle-G Biscuits', thumb: '🍪', units: 28 },
]

export const lowStockAlert = {
  title: 'Low Stock Alert',
  body: '3 products are running low.',
}

export const login = {
  title: 'Welcome back!',
  subtitle: 'Sign in to your store',
  phonePlaceholder: '+91 98765 43210',
  passwordValue: 'paybasket',
  signIn: 'Sign In',
  paytmCta: 'Continue with Paytm',
  newUser: 'New to PayBasket?',
  createAccount: 'Create an account',
}

export const splash = {
  tagline: 'Your AI Store Partner',
  poweredBy: 'Powered by',
  shopSign: 'Har Dukaan Zyada Aage',
}
