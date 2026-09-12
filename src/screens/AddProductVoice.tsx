import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AiChatDock } from '../components/AiChatDock'
import { Button, ErrorState, Thumb } from '../components/ui'
import { CheckCircleIcon } from '../components/icons'
import { addProductVoice, categories, storeManagerThread } from '../lib/mockData'
import { addProduct, sendChat } from '../lib/api'
import { thumbFor } from '../lib/api/map'
import { inr } from '../lib/format'

interface Draft {
  name: string
  /** Maps to the record's `image` field. Optional: most rows have none. */
  imageUrl: string
  categoryId: string
  brand: string
  packSize: string
  purchasePrice: string
  sellingPrice: string
  stock: string
  minStock: string
  supplier: string
}

const EMPTY: Draft = {
  name: '',
  imageUrl: '',
  categoryId: 'snacks',
  brand: '',
  packSize: '',
  purchasePrice: '',
  sellingPrice: '',
  stock: '',
  minStock: '',
  supplier: '',
}

/** What the Store Manager AI extracted from the spoken request. */
const AI_EXTRACTED: Draft = {
  name: 'Maggi 2-Minute Noodles',
  imageUrl: '',
  categoryId: 'noodles',
  brand: 'Nestlé',
  packSize: '70g',
  purchasePrice: '12',
  sellingPrice: '20',
  stock: '20',
  minStock: '5',
  supplier: 'Local Distributor',
}

const labelFor = (categoryId: string) => categories.find((c) => c.id === categoryId)?.label ?? 'General'

export default function AddProduct() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const canSave = draft.name.trim() !== '' && draft.sellingPrice.trim() !== '' && draft.stock.trim() !== ''

  const margin =
    draft.sellingPrice && draft.purchasePrice
      ? Number(draft.sellingPrice) - Number(draft.purchasePrice)
      : null

  async function save() {
    if (!canSave || saving) return
    setSaving(true)
    setError(null)
    try {
      await addProduct({
        name: draft.name,
        brand: draft.brand,
        category: labelFor(draft.categoryId),
        packSize: draft.packSize,
        purchasePrice: Number(draft.purchasePrice) || 0,
        sellingPrice: Number(draft.sellingPrice),
        stock: Number(draft.stock),
        minStock: draft.minStock ? Number(draft.minStock) : undefined,
        supplier: draft.supplier,
      })
      setSaved(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save that product.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <AppShell title="Add Product" showNav={false} onBack={() => setSaved(false)}>
        <div className="mx-auto flex max-w-sm flex-col items-center pt-6 text-center">
          <span className="animate-pop-in flex h-20 w-20 items-center justify-center rounded-full bg-leaf-500 text-white">
            <CheckCircleIcon width={40} height={40} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-ink">Product added</h2>
          <p className="nums mt-1 text-base text-ink-soft">
            {draft.name} · {draft.stock} units · {inr(Number(draft.sellingPrice) || 0)}
          </p>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Button
              onClick={() => {
                setDraft(EMPTY)
                setSaved(false)
              }}
            >
              Add Another
            </Button>
            <Button variant="secondary" onClick={() => navigate('/inventory')}>
              View Inventory
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <>
      <AppShell
        title={addProductVoice.title}
        subtitle="Fill the details, or ask the assistant to do it for you"
        width="wide"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={!canSave || saving}>
              {saving ? 'Saving…' : 'Save Product'}
            </Button>
          </div>
        }
      >
        {error && (
          <div className="mb-4">
            <ErrorState message={error} onRetry={() => void save()} />
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 md:items-start">
          <section className="space-y-4">
            <Field label="Product name" required>
              <input
                id="ap-name"
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Maggi 2-Minute Noodles"
                className={inputClass}
              />
            </Field>

            <Field label="Image URL">
              <input
                id="ap-image"
                type="url"
                inputMode="url"
                value={draft.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
                placeholder="https://… (optional)"
                className={inputClass}
              />
              <span className="mt-1.5 block text-xs text-ink-faint">
                Leave it empty and the tile falls back to an icon picked from the name.
              </span>
            </Field>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => set('categoryId', c.id)}
                      aria-pressed={draft.categoryId === c.id}
                      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                        draft.categoryId === c.id
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-hairline bg-surface text-ink-soft hover:border-brand-300'
                      }`}
                    >
                      <span aria-hidden="true">{c.thumb}</span>
                      {c.label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand">
                <input
                  id="ap-brand"
                  value={draft.brand}
                  onChange={(e) => set('brand', e.target.value)}
                  placeholder="Nestlé"
                  className={inputClass}
                />
              </Field>
              <Field label="Pack size">
                <input
                  id="ap-pack"
                  value={draft.packSize}
                  onChange={(e) => set('packSize', e.target.value)}
                  placeholder="70g"
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase price">
                <MoneyInput
                  id="ap-purchase"
                  value={draft.purchasePrice}
                  onChange={(v) => set('purchasePrice', v)}
                />
              </Field>
              <Field label="Selling price" required>
                <MoneyInput id="ap-selling" value={draft.sellingPrice} onChange={(v) => set('sellingPrice', v)} />
              </Field>
            </div>

            {margin !== null && (
              <p
                className={`nums rounded-xl px-4 py-2.5 text-sm font-medium ${
                  margin >= 0 ? 'bg-leaf-50 text-leaf-700' : 'bg-bad-bg text-bad'
                }`}
              >
                {margin >= 0 ? `Margin ₹${margin} per unit` : `Selling below cost by ₹${Math.abs(margin)}`}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening stock" required>
                <input
                  id="ap-stock"
                  type="number"
                  inputMode="numeric"
                  value={draft.stock}
                  onChange={(e) => set('stock', e.target.value)}
                  placeholder="20"
                  className={`${inputClass} nums`}
                />
              </Field>
              <Field label="Min. stock">
                <input
                  id="ap-min"
                  type="number"
                  inputMode="numeric"
                  value={draft.minStock}
                  onChange={(e) => set('minStock', e.target.value)}
                  placeholder="5"
                  className={`${inputClass} nums`}
                />
              </Field>
            </div>

            <Field label="Supplier">
              <input
                id="ap-supplier"
                value={draft.supplier}
                onChange={(e) => set('supplier', e.target.value)}
                placeholder="Local Distributor"
                className={inputClass}
              />
            </Field>

            <div className="rounded-xl border border-hairline bg-surface p-4">
              <p className="label-caps mb-2.5 text-xs font-semibold text-ink-faint">Preview</p>
              <div className="flex items-center gap-3">
                <Thumb
                  emoji={thumbFor(draft.name || 'product', labelFor(draft.categoryId))}
                  src={draft.imageUrl.trim() || null}
                />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink">{draft.name || 'Product name'}</p>
                  <p className="text-sm text-ink-soft">
                    {[draft.brand, draft.packSize].filter(Boolean).join(' | ') || 'Brand | Pack size'}
                  </p>
                  <p className="nums text-sm font-medium text-ink">
                    {draft.sellingPrice ? inr(Number(draft.sellingPrice) || 0) : '₹—'}
                    {draft.stock && <span className="text-ink-faint"> · {draft.stock} units</span>}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </AppShell>

      <AiChatDock
        agentName="Store Manager AI"
        tone="brand"
        launcherLabel="Add by voice"
        placeholder="Say what you bought..."
        tip={addProductVoice.tipExample}
        openingTurns={storeManagerThread.slice(0, 2).map((m) => ({
          id: m.id,
          from: m.from === 'agent' ? 'agent' : 'user',
          text: m.text ?? '',
        }))}
        onSend={(message) => sendChat({ message, role: 'owner' })}
        action={{ label: 'Fill the form with these details', onClick: () => setDraft(AI_EXTRACTED) }}
        aboveFooter
      />
    </>
  )
}

const inputClass =
  'h-12 w-full rounded-xl border border-hairline bg-surface px-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-400'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-bad"> *</span>}
      </span>
      {children}
    </label>
  )
}

function MoneyInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <span className="flex h-12 items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3.5 focus-within:border-brand-400">
      <span className="shrink-0 text-base text-ink-faint">₹</span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="nums min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
      />
    </span>
  )
}
