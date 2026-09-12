import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { AppShell } from '../components/AppShell'
import { Button, ErrorState, LoadingBlock } from '../components/ui'
import { RefreshIcon } from '../components/icons'
import { payment } from '../lib/mockData'
import { buildUpiUri } from '../lib/upi'
import { confirmPayment, getOrder, storeName } from '../lib/api'
import type { OrderRecord } from '../lib/api'
import { inr } from '../lib/format'
import { usePoll, useResource } from '../lib/useResource'

/** Statuses that mean the money is in and the sale can be shown as done. */
const SETTLED = new Set(['PAYMENT_RECEIVED', 'RECONCILED', 'COMPLETED'])

export default function Payment() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orderId = params.get('order') ?? ''

  const [settling, setSettling] = useState(false)
  const [settleError, setSettleError] = useState<string | null>(null)

  const order = useResource(() => (orderId ? getOrder(orderId) : Promise.resolve(null)), [orderId])

  const done = useCallback(
    (id: string) => navigate(`/payment/success?order=${encodeURIComponent(id)}`, { replace: true }),
    [navigate],
  )

  // The provider's webhook lands on your backend, not here, so the screen
  // watches the order rather than the payment: once it moves past
  // WAITING_FOR_PAYMENT somebody has paid.
  usePoll(
    () => {
      if (settling) return
      void getOrder(orderId)
        .then((latest) => {
          if (latest && SETTLED.has(latest.status)) done(latest.order_id)
        })
        .catch(() => {
          /* a dropped poll is not worth interrupting the counter for */
        })
    },
    4000,
    Boolean(orderId) && !settling,
  )

  /** Manual confirmation, for cash or a demo with no webhook wired up. */
  async function markReceived(record: OrderRecord) {
    if (settling) return
    setSettling(true)
    setSettleError(null)
    try {
      const completed = await confirmPayment(record)
      done(completed.order_id)
    } catch (error) {
      setSettleError(error instanceof Error ? error.message : 'Could not record that payment.')
      setSettling(false)
    }
  }

  return (
    <AppShell
      title="Payment"
      subtitle={order.data?.order_id}
      showNav={false}
      footer={
        <Button variant="secondary" className="w-full" onClick={() => navigate('/chat/sales')}>
          Cancel Transaction
        </Button>
      }
    >
      <div className="mx-auto flex max-w-sm flex-col items-center">
        {order.error && <ErrorState message={order.error} onRetry={order.reload} />}

        {order.loading && !order.data && <LoadingBlock label="Loading bill" rows={2} />}

        {!order.loading && !order.error && !order.data && (
          <div className="w-full">
            <ErrorState
              message={
                orderId
                  ? 'That bill could not be found. It may have been cancelled.'
                  : 'No bill to pay for — build a cart first.'
              }
              onRetry={() => navigate('/chat/sales')}
            />
          </div>
        )}

        {order.data && <Bill order={order.data} />}

        {settleError && (
          <div className="mt-4 w-full">
            <ErrorState message={settleError} onRetry={() => order.data && void markReceived(order.data)} />
          </div>
        )}

        {order.data && (
          <button
            type="button"
            disabled={settling}
            onClick={() => void markReceived(order.data!)}
            className="mt-4 flex w-full items-start gap-2.5 rounded-xl border border-leaf-100 bg-leaf-50 px-4 py-3.5 text-left disabled:opacity-60"
          >
            <RefreshIcon width={18} height={18} className="mt-0.5 shrink-0 animate-spin text-leaf-600" />
            <span className="min-w-0">
              <span className="block text-base font-medium text-leaf-700">
                {settling ? 'Recording payment…' : payment.waitingLabel}
              </span>
              <span className="block text-sm text-leaf-600">
                {settling ? 'Cutting stock and writing the sale.' : `${payment.waitingSub} Tap if it already has.`}
              </span>
            </span>
          </button>
        )}
      </div>
    </AppShell>
  )
}

function Bill({ order }: { order: OrderRecord }) {
  const upiUri = buildUpiUri({
    amount: order.total_amount,
    billId: order.order_id,
    payeeName: storeName,
  })

  return (
    <div className="w-full rounded-2xl border border-hairline bg-surface p-5 text-center">
      <p className="text-sm text-ink-soft">Total Amount</p>
      <p className="nums mt-0.5 text-4xl font-bold text-ink">{inr(order.total_amount)}</p>

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
  )
}
