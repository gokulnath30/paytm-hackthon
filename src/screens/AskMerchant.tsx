import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { AppHeader } from '../components/AppHeader'
import { AlertIcon, SparkleIcon } from '../components/icons'
import { VoiceButton } from '../components/VoiceButton'
import { getPayment, getProducts, getTopSellers, findProduct, confirmUntaggedPayment } from '../lib/store'
import { parseCartUtterance } from '../lib/voiceParser'
import { useVoiceInput } from '../lib/speech'
import { useLang } from '../lib/langContext'
import { formatRupees, formatTime } from '../lib/format'
import type { CartItem, Payment } from '../lib/types'

export default function AskMerchant() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const navigate = useNavigate()
  const { lang } = useLang()
  const [payment, setPayment] = useState<Payment | undefined>()
  const [cart, setCart] = useState<CartItem[]>([])
  const [textInput, setTextInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (paymentId) setPayment(getPayment(paymentId))
  }, [paymentId])

  const { supported, listening, start, stop } = useVoiceInput({
    lang,
    onFinalResult: (text) => applyUtterance(text),
  })

  const chips = useMemo(() => {
    if (!payment) return []
    // Suggest recently best-selling items first (most likely to match a walk-in sale),
    // falling back to the rest of the catalog if there isn't enough sales history yet.
    const allProducts = getProducts()
    const topIds = getTopSellers(7, 5).map((t) => t.productId)
    const byId = new Map(allProducts.map((p) => [p.id, p]))
    const ranked = [
      ...topIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => !!p),
      ...allProducts.filter((p) => !topIds.includes(p.id)),
    ].slice(0, 3)

    return ranked.map((p) => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      qty: Math.max(1, Math.round(payment.amount / p.price / ranked.length)),
    }))
  }, [payment])

  function applyUtterance(text: string) {
    const lines = parseCartUtterance(text)
    setCart((prev) => {
      const next = [...prev]
      for (const line of lines) {
        const product = findProduct(line.name)
        if (!product) continue
        const idx = next.findIndex((c) => c.productId === product.id)
        if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + line.qty }
        else next.push({ productId: product.id, name: product.name, price: product.price, qty: line.qty })
      }
      return next
    })
  }

  function toggleChip(chip: { productId: string; name: string; price: number; qty: number }) {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.productId === chip.productId)
      if (idx >= 0) return prev.filter((c) => c.productId !== chip.productId)
      return [...prev, { productId: chip.productId, name: chip.name, price: chip.price, qty: chip.qty }]
    })
  }

  function submitText() {
    if (!textInput.trim()) return
    applyUtterance(textInput)
    setTextInput('')
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  function confirm() {
    if (!paymentId || cart.length === 0) return
    confirmUntaggedPayment(paymentId, cart)
    navigate(`/payment/${paymentId}/reconcile`, { replace: true })
  }

  if (!payment) {
    return (
      <Screen>
        <AppHeader title="Untagged Payment" />
        <div className="flex flex-1 items-center justify-center text-[14px] text-slate-400">Loading…</div>
      </Screen>
    )
  }

  return (
    <Screen>
      <AppHeader title="Untagged Payment" />

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3.5">
          <AlertIcon width={20} height={20} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-[14px] text-amber-700">
            <span className="font-semibold">No matching bill found</span>
            <br />
            Payment received: {formatRupees(payment.amount)} · {formatTime(payment.createdAt)}
          </p>
        </div>

        <div className="mb-5 flex justify-start">
          <div className="flex max-w-[85%] items-start gap-2 rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-[15px] text-slate-800 shadow-sm border border-slate-200">
            <SparkleIcon width={16} height={16} className="mt-0.5 shrink-0 text-brand-500" />
            <span>{formatRupees(payment.amount)} ka payment mila. Kya becha?</span>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {chips.map((chip) => {
            const active = cart.some((c) => c.productId === chip.productId)
            return (
              <button
                key={chip.productId}
                type="button"
                onClick={() => toggleChip(chip)}
                className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                  active ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
                }`}
              >
                {chip.qty} {chip.name}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-500"
          >
            Other item
          </button>
        </div>

        {cart.length > 0 && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-[14px]">
                <span className="text-slate-700">
                  {item.qty} × {item.name}
                </span>
                <span className="font-medium text-slate-900">{formatRupees(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[14px] font-semibold">
              <span>Total tagged</span>
              <span className={cartTotal === payment.amount ? 'text-emerald-600' : 'text-slate-900'}>
                {formatRupees(cartTotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="safe-bottom border-t border-slate-200 bg-white px-4 py-4">
        <div className="mb-3 flex items-center gap-2">
          <input
            ref={inputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitText()}
            placeholder="Type or speak..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[14px] outline-none focus:border-brand-400"
          />
          <VoiceButton listening={listening} onClick={() => (listening ? stop() : start())} disabled={!supported} size="md" />
        </div>
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={confirm}
          className="w-full rounded-2xl bg-brand-500 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-brand-500/30 transition-opacity disabled:opacity-40"
        >
          Confirm &amp; Update Inventory
        </button>
      </div>
    </Screen>
  )
}
