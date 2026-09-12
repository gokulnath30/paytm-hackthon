import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { AppHeader } from '../components/AppHeader'
import { CheckCircleIcon } from '../components/icons'
import { getPayment, reconcilePayment } from '../lib/store'
import { formatRupees, formatTime } from '../lib/format'
import type { Bill, Payment } from '../lib/types'

function orderNumber(billId: string) {
  return billId.replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase()
}

export default function Reconciliation() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const navigate = useNavigate()
  const [payment, setPayment] = useState<Payment | undefined>()
  const [bill, setBill] = useState<Bill | undefined>()
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    if (!paymentId) return
    const p = getPayment(paymentId)
    setPayment(p)
    const matchedBill = reconcilePayment(paymentId)
    if (!matchedBill) {
      navigate(`/payment/${paymentId}/ask`, { replace: true })
      return
    }
    setBill(matchedBill)
    setResolved(true)
  }, [paymentId, navigate])

  if (!payment || !bill || !resolved) {
    return (
      <Screen>
        <AppHeader title="Matching Payment" />
        <div className="flex flex-1 items-center justify-center text-[14px] text-slate-400">Matching…</div>
      </Screen>
    )
  }

  return (
    <Screen>
      <AppHeader title="Matching Payment" />

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3.5">
          <CheckCircleIcon width={20} height={20} className="mt-0.5 shrink-0 text-emerald-500" />
          <p className="text-[14px] text-emerald-700">
            <span className="font-semibold">Payment matched!</span> {formatRupees(payment.amount)} at{' '}
            {formatTime(payment.createdAt)} → Order #{orderNumber(bill.id)}
          </p>
        </div>

        <div className="space-y-2.5">
          {bill.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[11px] font-semibold text-brand-600">
                {item.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-slate-900">{item.name}</p>
                <p className="text-[13px] text-slate-500">
                  {item.qty} × {formatRupees(item.price)}
                </p>
              </div>
              <span className="text-[15px] font-semibold text-rose-500">-{item.qty}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-emerald-50 px-4 py-3.5">
          <CheckCircleIcon width={18} height={18} className="shrink-0 text-emerald-500" />
          <p className="text-[13px] font-medium text-emerald-700">Inventory updated successfully!</p>
        </div>
      </div>

      <div className="safe-bottom border-t border-slate-200 bg-white px-4 py-4">
        <button
          type="button"
          onClick={() => navigate('/insights')}
          className="w-full rounded-2xl bg-brand-500 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-brand-500/30 active:scale-[0.99]"
        >
          View Updated Inventory
        </button>
      </div>
    </Screen>
  )
}
