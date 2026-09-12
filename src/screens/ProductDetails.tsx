import { useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, EmptyState, ErrorState, LoadingBlock, Pill, Thumb } from '../components/ui'
import { AlertIcon, BoxIcon, CartIcon, TagIcon } from '../components/icons'
import type { Product } from '../lib/mockData'
import { getProduct } from '../lib/api'
import { inr } from '../lib/format'
import { useResource } from '../lib/useResource'

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>()
  const resource = useResource(() => getProduct(productId ?? ''), [productId])

  return (
    <AppShell
      title="Product Details"
      width="wide"
      headerRight={
        <button type="button" className="shrink-0 px-2 text-base font-semibold text-brand-600 hover:underline">
          Edit
        </button>
      }
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary">Adjust Stock</Button>
          <Button>Update Price</Button>
        </div>
      }
    >
      {resource.error && <ErrorState message={resource.error} onRetry={resource.reload} />}
      {resource.loading && !resource.data && <LoadingBlock label="Loading product" rows={3} />}
      {!resource.loading && !resource.error && !resource.data && (
        <EmptyState>That product is no longer in the catalogue.</EmptyState>
      )}
      {resource.data && <Detail product={resource.data} />}
    </AppShell>
  )
}

function Detail({ product }: { product: Product }) {
  const tiles = [
    { label: 'Current Stock', value: `${product.stock} units`, Icon: BoxIcon, tone: 'brand' as const },
    { label: 'Selling Price', value: inr(product.sellingPrice), Icon: TagIcon, tone: 'brand' as const },
    { label: 'Purchase Price', value: inr(product.purchasePrice), Icon: CartIcon, tone: 'brand' as const },
    { label: 'Min. Stock', value: `${product.minStock} units`, Icon: AlertIcon, tone: 'bad' as const },
  ]

  const info = [
    { label: 'Brand', value: product.brand },
    { label: 'Category', value: product.category },
    { label: 'Pack Size', value: product.packSize },
    { label: 'Supplier', value: product.supplier },
    { label: 'Added On', value: product.addedOn },
  ]

  return (
    <div className="grid gap-5 md:grid-cols-2 md:items-start">
      <div>
        <div className="flex items-start gap-3.5">
          <Thumb emoji={product.thumb} size="lg" />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-ink">{product.name}</h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              {product.brand} <span className="text-ink-faint">|</span> {product.packSize}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill tone={product.state === 'in-stock' ? 'good' : 'bad'}>
                {product.state === 'in-stock' ? 'In Stock' : product.state === 'low' ? 'Low Stock' : 'Out of Stock'}
              </Pill>
              <span className="text-sm text-ink-soft">{product.category}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {tiles.map(({ label, value, Icon, tone }) => (
            <div key={label} className="rounded-xl border border-hairline bg-surface p-3.5">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    tone === 'bad' ? 'bg-bad-bg text-bad' : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  <Icon width={15} height={15} />
                </span>
                <p className="min-w-0 text-xs leading-tight text-ink-soft">{label}</p>
              </div>
              <p className="nums mt-1.5 text-lg font-bold text-ink">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-2.5 text-base font-semibold text-ink">Product Information</h2>
        <dl className="rounded-xl border border-hairline bg-surface px-4">
          {info.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3 border-b border-hairline py-3 last:border-0">
              <dt className="text-base text-ink-soft">{label}</dt>
              <dd className="min-w-0 truncate text-base font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
