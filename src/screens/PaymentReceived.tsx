import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPayment } from '../lib/store'
import { formatRupees, formatTime } from '../lib/format'
import { playPaymentChime, vibrate } from '../lib/sound'
import { CheckCircleIcon } from '../components/icons'

export default function PaymentReceived() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const navigate = useNavigate()
  const payment = paymentId ? getPayment(paymentId) : undefined

  useEffect(() => {
    playPaymentChime()
    vibrate([40, 60, 120])
  }, [])

  useEffect(() => {
    if (!paymentId) return
    const t = setTimeout(() => navigate(`/payment/${paymentId}/reconcile`, { replace: true }), 2200)
    return () => clearTimeout(t)
  }, [paymentId, navigate])

  if (!payment) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-900 px-6 text-center text-white">
        Payment not found.
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-brand-900 px-6 py-10 text-white sm:mx-auto sm:max-w-md">
      <div className="mb-8 flex items-center justify-center gap-2 text-[13px] font-medium text-brand-200">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10">🔊</span>
        Paytm Soundbox
      </div>

      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/30">
        <span className="flex h-16 w-16 animate-mic-pulse items-center justify-center rounded-full bg-brand-400 text-3xl">
          🎵
        </span>
      </div>

      <p className="text-center text-[24px] font-bold">Payment Received!</p>
      <p className="mt-3 text-center text-[44px] font-extrabold tracking-tight">{formatRupees(payment.amount)}</p>
      <p className="mt-2 text-center text-[14px] text-brand-200">
        {formatTime(payment.createdAt)} · UPI from Customer
      </p>

      <div className="mt-10 flex items-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-slate-800 shadow-lg">
        <CheckCircleIcon width={20} height={20} className="shrink-0 text-emerald-500" />
        <p className="text-[13px]">We&apos;ll match this payment with your bill automatically.</p>
      </div>
    </div>
  )
}
