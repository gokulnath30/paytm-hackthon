import { findProduct, getLowStock, getTopSellers } from './store'
import { formatRupees } from './format'

/**
 * Small rule-based responder for the Home chat's free-text/voice queries
 * ("Maggi kitna bacha hai?", "Kya order karna hai?"). Not a real LLM —
 * pattern-matches common kirana-owner questions against local store data.
 */
export function answerAssistantQuery(raw: string): string {
  const text = raw.trim().toLowerCase()
  if (!text) return "Sorry, I didn't catch that. Try again?"

  // Stock lookup: "<product> kitna bacha hai" / "how much <product> left" / "<product> stock"
  const stockPattern = /(.+?)\s*(kitna bacha|kitne bache|stock|left|bacha hai)/i
  const stockMatch = text.match(stockPattern)
  if (stockMatch) {
    const productQuery = stockMatch[1].trim()
    const product = findProduct(productQuery)
    if (product) {
      return `${product.name} ${product.stock} left in stock.${product.stock <= 5 ? ' Running low — consider reordering soon.' : ''}`
    }
    return `I couldn't find "${productQuery}" in your inventory. Try "Add new product" to add it.`
  }

  // Reorder recommendation: "kya order karna hai" / "what should I order"
  if (/order karna|should i order|what to order|reorder/i.test(text)) {
    const lowStock = getLowStock(5)
    if (lowStock.length === 0) return 'Your stock levels look healthy — nothing urgent to reorder today.'
    const lines = lowStock.slice(0, 3).map((p) => `${p.name} (${p.stock} left)`)
    return `Based on recent sales, you should order more of: ${lines.join(', ')}.`
  }

  // Top sellers
  if (/top sell|best sell|kya bikta|popular/i.test(text)) {
    const top = getTopSellers(7, 3)
    if (top.length === 0) return 'No sales recorded yet this week.'
    return `Top sellers this week: ${top.map((t) => `${t.name} (${t.qty} sold)`).join(', ')}.`
  }

  // Direct product name -> stock
  const product = findProduct(text)
  if (product) {
    return `${product.name}: ${product.stock} in stock, priced at ${formatRupees(product.price)}.`
  }

  return "I can help you add products, create a bill, check inventory, or share insights. Try one of the quick actions below, or say something like \"Maggi kitna bacha hai?\""
}
