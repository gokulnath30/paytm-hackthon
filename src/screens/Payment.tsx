import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/ui'
import { RefreshIcon } from '../components/icons'
import { initialCart, payment } from '../lib/mockData'
import { buildUpiUri } from '../lib/upi'

export default function Payment() {
  const navigate = useNavigate()
  const total = initialCart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
  const upiUri = buildUpiUri({ amount: total, billId: '104', payeeName: 'Sharma Kirana Store' })

  return (
    <AppShell
      title="Payment"
      subtitle={payment.customer}
      showNav={false}
      footer={
        <Button variant="secondary" className="w-full" onClick={() => navigate('/chat/sales')}>
          Cancel Transaction
        </Button>
      }
    >
      <div className="mx-auto flex max-w-sm flex-col items-center">
        <div className="w-full rounded-2xl border border-hairline bg-surface p-5 text-center">
          <p className="text-sm text-ink-soft">Total Amount</p>
          <p className="nums mt-0.5 text-4xl font-bold text-ink">₹{total}</p>

          <div className="mt-4 flex justify-center">
            <div className="rounded-xl border border-hairline p-3">
              <QRCodeSVG value={upiUri} size={168} level="M" fgColor="#13315c" />
            </div>
          </div>

          <p className="mt-4 text-xl font-bold tracking-tight text-brand-600">Paytm</p>
          <p className="text-sm text-ink-soft">Scan to Pay</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium text-ink-faint">
            {payment.methods.map((m, i) => (
              <span key={m} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">|</span>}
                {m}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/payment/success')}
          className="mt-4 flex w-full items-start gap-2.5 rounded-xl border border-leaf-100 bg-leaf-50 px-4 py-3.5 text-left"
        >
          <RefreshIcon width={18} height={18} className="mt-0.5 shrink-0 animate-spin text-leaf-600" />
          <span className="min-w-0">
            <span className="block text-base font-medium text-leaf-700">{payment.waitingLabel}</span>
            <span className="block text-sm text-leaf-600">{payment.waitingSub}</span>
          </span>
        </button>
      </div>
    </AppShell>
  )
}
