import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Thumb } from '../components/ui'
import { CheckIcon, CheckCircleIcon, ReceiptIcon } from '../components/icons'
import { initialCart, payment } from '../lib/mockData'

export default function TransactionSuccess() {
  const navigate = useNavigate()
  const total = initialCart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)

  return (
    <AppShell
      title=""
      showBack={false}
      showNav={false}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => navigate('/chat/sales')}>New Sale</Button>
          <Button variant="secondary" icon={ReceiptIcon}>
            View Receipt
          </Button>
        </div>
      }
    >
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <div className="animate-pop-in relative mt-2 flex h-24 w-24 items-center justify-center rounded-full bg-leaf-500 text-white">
          <CheckIcon width={44} height={44} strokeWidth={2.5} />
          <Confetti />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-ink">{payment.successTitle}</h1>
        <p className="nums mt-1 text-lg font-semibold text-leaf-600">₹{total} received</p>
        <p className="nums mt-0.5 text-base text-ink-soft">{payment.orderId}</p>

        <div className="mt-5 w-full rounded-xl border border-hairline bg-surface px-4">
          {initialCart.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 border-b border-hairline py-3">
              <Thumb emoji={item.thumb} size="sm" />
              <p className="min-w-0 flex-1 truncate text-left text-base text-ink">{item.name}</p>
              <p className="nums shrink-0 text-sm text-ink-soft">× {item.qty}</p>
              <p className="nums w-14 shrink-0 text-right text-base font-semibold text-ink">
                ₹{item.unitPrice * item.qty}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between py-3">
            <span className="text-base font-semibold text-ink">Total</span>
            <span className="nums text-base font-bold text-ink">₹{total}</span>
          </div>
        </div>

        <p className="mt-4 flex w-full items-center gap-2 rounded-xl bg-leaf-50 px-4 py-3 text-left text-sm font-medium text-leaf-700">
          <CheckCircleIcon width={17} height={17} className="shrink-0" />
          {payment.inventoryNote}
        </p>
      </div>
    </AppShell>
  )
}

/** Small burst around the success check. */
function Confetti() {
  const bits = [
    { x: -46, y: -18, c: '#2563eb', r: 12 },
    { x: 44, y: -26, c: '#f7b955', r: -20 },
    { x: -34, y: 34, c: '#16a34a', r: 40 },
    { x: 40, y: 30, c: '#dc2626', r: -35 },
    { x: 2, y: -50, c: '#6090fa', r: 8 },
    { x: -52, y: 8, c: '#f7b955', r: 60 },
  ]
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 block h-2 w-1.5 rounded-[1px]"
          style={{
            background: b.c,
            transform: `translate(${b.x}px, ${b.y}px) rotate(${b.r}deg)`,
          }}
        />
      ))}
    </span>
  )
}
