import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { AppHeader } from '../components/AppHeader'
import { VoiceButton } from '../components/VoiceButton'
import { CartLine } from '../components/CartLine'
import { MicIcon, CartIcon } from '../components/icons'
import { addBill, findProduct } from '../lib/store'
import { parseCartUtterance } from '../lib/voiceParser'
import { useVoiceInput } from '../lib/speech'
import { useLang } from '../lib/langContext'
import { formatRupees } from '../lib/format'
import type { CartItem } from '../lib/types'

export default function NewBill() {
  const navigate = useNavigate()
  const { lang, label } = useLang()
  const [utterance, setUtterance] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [warning, setWarning] = useState<string | null>(null)

  const { supported, listening, start, stop } = useVoiceInput({
    lang,
    onFinalResult: (text) => runParse(text),
  })

  function runParse(text: string) {
    setUtterance(text)
    const lines = parseCartUtterance(text)
    if (lines.length === 0) return

    const missing: string[] = []
    setCart((prev) => {
      const next = [...prev]
      for (const line of lines) {
        const product = findProduct(line.name)
        if (!product) {
          missing.push(line.name)
          continue
        }
        const idx = next.findIndex((c) => c.productId === product.id)
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + line.qty }
        } else {
          next.push({ productId: product.id, name: product.name, price: product.price, qty: line.qty })
        }
      }
      return next
    })

    setWarning(missing.length > 0 ? `Not found in inventory: ${missing.join(', ')}. Add it as a product first.` : null)
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0),
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  function generateQr() {
    if (cart.length === 0) return
    const bill = addBill({ items: cart, amount: total })
    navigate(`/bill/${bill.id}/qr`)
  }

  return (
    <Screen>
      <AppHeader title="New Bill" right={<CartIcon width={20} height={20} className="text-slate-400" />} />

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-4 flex justify-center">
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 shadow-sm">
            <MicIcon width={16} height={16} className="shrink-0 text-brand-500" />
            <span className="italic">{utterance || listening ? utterance || 'Listening…' : '"2 Maggi, 1 Parle-G"'}</span>
          </div>
        </div>

        <div className="mb-4 flex flex-col items-center gap-2">
          <VoiceButton listening={listening} onClick={() => (listening ? stop() : start())} disabled={!supported} size="md" />
          <p className="text-[12px] text-slate-400">{supported ? `Speak in ${label}, or type below` : 'Voice not supported — type below'}</p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <input
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                runParse(manualInput)
                setManualInput('')
              }
            }}
            placeholder="e.g. 2 Maggi, 1 Parle-G"
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-brand-400"
          />
          <button
            type="button"
            onClick={() => {
              runParse(manualInput)
              setManualInput('')
            }}
            className="rounded-full bg-brand-500 px-4 py-2.5 text-[13px] font-medium text-white active:scale-95"
          >
            Add
          </button>
        </div>

        {warning && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-700">{warning}</p>}

        {cart.length > 0 ? (
          <div className="space-y-2.5">
            {cart.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                onIncrement={() => changeQty(item.productId, 1)}
                onDecrement={() => changeQty(item.productId, -1)}
              />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-[14px] text-slate-400">Speak or type items to build the bill.</p>
        )}
      </div>

      <div className="safe-bottom border-t border-slate-200 bg-white px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[15px] font-medium text-slate-600">Total Amount</span>
          <span className="text-[22px] font-bold text-slate-900">{formatRupees(total)}</span>
        </div>
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={generateQr}
          className="w-full rounded-2xl bg-brand-500 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-brand-500/30 transition-opacity disabled:opacity-40"
        >
          Generate Paytm QR
        </button>
      </div>
    </Screen>
  )
}
