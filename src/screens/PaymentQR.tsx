import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Screen } from '../components/Screen'
import { AppHeader } from '../components/AppHeader'
import { getBill, addPayment } from '../lib/store'
import { buildUpiUri } from '../lib/upi'
import { formatRupees } from '../lib/format'
import type { Bill } from '../lib/types'

export default function PaymentQR() {
  const { billId } = useParams<{ billId: string }>()
  const navigate = useNavigate()
  const [bill, setBill] = useState<Bill | undefined>(() => (billId ? getBill(billId) : undefined))
  const [simAmount, setSimAmount] = useState('')

  useEffect(() => {
    if (!billId) return
    const b = getBill(billId)
    setBill(b)
    setSimAmount(b ? String(b.amount) : '')
  }, [billId])

  if (!bill) {
    return (
      <Screen>
        <AppHeader title="Scan & Pay" />
        <div className="flex flex-1 items-center justify-center px-6 text-center text-[14px] text-slate-500">
          Bill not found. It may have already been paid.
        </div>
      </Screen>
    )
  }

  const upiUri = buildUpiUri({ amount: bill.amount, billId: bill.id })

  function simulatePayment() {
    const amount = Number(simAmount)
    if (!Number.isFinite(amount) || amount <= 0) return
    const payment = addPayment({ amount, source: 'Customer UPI' })
    navigate(`/payment/${payment.id}/received`)
  }

  return (
    <Screen>
      <AppHeader title="Scan & Pay" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[20px] font-bold tracking-tight text-brand-700">
            Paytm <span className="font-normal text-slate-500">Kirana Store</span>
          </p>
          <p className="mb-5 text-[13px] text-slate-500">Scan this QR to pay</p>

          <div className="rounded-2xl border border-slate-100 p-3">
            <QRCodeSVG value={upiUri} size={200} level="M" fgColor="#0b3b8c" />
          </div>

          <p className="mt-5 text-[13px] text-slate-500">Amount</p>
          <p className="text-[30px] font-bold text-slate-900">{formatRupees(bill.amount)}</p>
        </div>

        <p className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-center text-[13px] text-brand-700">
          Show this QR to your customer. You&apos;ll get a sound notification when payment is received.
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-400">Demo control</p>
          <p className="mb-3 text-[13px] text-slate-500">
            No live Paytm/UPI rails are connected in this prototype — use this to simulate the soundbox webhook firing
            when a customer pays.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-slate-500">₹</span>
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[14px] outline-none focus:border-brand-400"
            />
            <button
              type="button"
              onClick={simulatePayment}
              className="ml-auto rounded-xl bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white active:scale-95"
            >
              Simulate Payment Received
            </button>
          </div>
        </div>
      </div>
    </Screen>
  )
}
