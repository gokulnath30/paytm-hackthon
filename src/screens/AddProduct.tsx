import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { AppHeader } from '../components/AppHeader'
import { VoiceButton } from '../components/VoiceButton'
import { CheckCircleIcon, EditIcon, MicIcon } from '../components/icons'
import { upsertProductByVoice, findProduct } from '../lib/store'
import { parseAddProductUtterance, type ParsedProductUtterance } from '../lib/voiceParser'
import { useVoiceInput } from '../lib/speech'
import { useLang } from '../lib/langContext'
import { formatRupees } from '../lib/format'

type Detected = ParsedProductUtterance & { category: string; brand: string }

export default function AddProduct() {
  const navigate = useNavigate()
  const { lang, label } = useLang()
  const [utterance, setUtterance] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [detected, setDetected] = useState<Detected | null>(null)
  const [editing, setEditing] = useState(false)
  const [added, setAdded] = useState(false)
  const [restocked, setRestocked] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const { supported, listening, start, stop } = useVoiceInput({
    lang,
    onFinalResult: (text) => runParse(text),
  })

  function runParse(text: string) {
    setUtterance(text)
    setAdded(false)
    const parsed = parseAddProductUtterance(text)
    if (!parsed) {
      setDetected(null)
      setParseError(`Couldn't understand that. Try "<quantity> <product>, <price> rupay" — e.g. "Das Maggi, bees rupay".`)
      return
    }
    setParseError(null)
    const existing = findProduct(parsed.name)
    setDetected({
      ...parsed,
      category: existing?.category ?? 'General',
      brand: existing?.brand ?? parsed.name,
    })
  }

  function handleAdd() {
    if (!detected) return
    const { restocked: wasRestock } = upsertProductByVoice({
      name: detected.name,
      brand: detected.brand,
      category: detected.category,
      price: detected.price,
      qty: detected.qty,
    })
    setRestocked(wasRestock)
    setAdded(true)
  }

  function reset() {
    setUtterance('')
    setManualInput('')
    setDetected(null)
    setAdded(false)
    setRestocked(false)
    setParseError(null)
  }

  return (
    <Screen>
      <AppHeader title="Add Product (Voice)" />

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {!added && (
          <>
            <div className="mb-5 flex justify-center">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 shadow-sm">
                <MicIcon width={16} height={16} className="shrink-0 text-brand-500" />
                <span className="italic">{utterance || listening ? utterance || 'Listening…' : '"Das Maggi, bees rupay"'}</span>
              </div>
            </div>

            <div className="mb-5 flex flex-col items-center gap-2">
              <VoiceButton listening={listening} onClick={() => (listening ? stop() : start())} disabled={!supported} />
              <p className="text-[12px] text-slate-400">{supported ? `Speak in ${label}, or type below` : 'Voice not supported — type below'}</p>
            </div>

            <div className="mb-5 flex items-center gap-2">
              <input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runParse(manualInput)}
                placeholder="e.g. Das Maggi, bees rupay"
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-brand-400"
              />
              <button
                type="button"
                onClick={() => runParse(manualInput)}
                className="rounded-full bg-brand-500 px-4 py-2.5 text-[13px] font-medium text-white active:scale-95"
              >
                Parse
              </button>
            </div>

            {parseError && (
              <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-700">{parseError}</p>
            )}
          </>
        )}

        {detected && !added && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
                <CheckCircleIcon width={16} height={16} />
                Product detected
              </span>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="flex items-center gap-1 text-[13px] font-medium text-brand-500"
              >
                <EditIcon width={14} height={14} />
                {editing ? 'Done' : 'Edit'}
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-[15px] font-semibold text-brand-600">
                {detected.name.slice(0, 2).toUpperCase()}
              </span>
              {!editing ? (
                <p className="text-[17px] font-semibold text-slate-900">{detected.name}</p>
              ) : (
                <input
                  value={detected.name}
                  onChange={(e) => setDetected({ ...detected, name: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-[15px] outline-none focus:border-brand-400"
                />
              )}
            </div>

            <dl className="space-y-2.5 text-[14px]">
              <Row label="Quantity" editing={editing}>
                {editing ? (
                  <input
                    type="number"
                    value={detected.qty}
                    onChange={(e) => setDetected({ ...detected, qty: Number(e.target.value) })}
                    className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right outline-none focus:border-brand-400"
                  />
                ) : (
                  `${detected.qty} (in stock)`
                )}
              </Row>
              <Row label="Price" editing={editing}>
                {editing ? (
                  <input
                    type="number"
                    value={detected.price}
                    onChange={(e) => setDetected({ ...detected, price: Number(e.target.value) })}
                    className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right outline-none focus:border-brand-400"
                  />
                ) : (
                  formatRupees(detected.price)
                )}
              </Row>
              <Row label="Category" editing={editing}>
                {editing ? (
                  <input
                    value={detected.category}
                    onChange={(e) => setDetected({ ...detected, category: e.target.value })}
                    className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-right outline-none focus:border-brand-400"
                  />
                ) : (
                  detected.category
                )}
              </Row>
              <Row label="Brand" editing={editing}>
                {editing ? (
                  <input
                    value={detected.brand}
                    onChange={(e) => setDetected({ ...detected, brand: e.target.value })}
                    className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-right outline-none focus:border-brand-400"
                  />
                ) : (
                  detected.brand
                )}
              </Row>
            </dl>
          </div>
        )}

        {added && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-8 text-center">
            <CheckCircleIcon width={40} height={40} className="text-emerald-500" />
            <p className="text-[16px] font-semibold text-emerald-700">
              {restocked ? 'Inventory restocked successfully!' : 'Product added successfully!'}
            </p>
            <p className="text-[13px] text-emerald-600">
              {detected?.name} · +{detected?.qty} stock · {detected && formatRupees(detected.price)}
            </p>
          </div>
        )}
      </div>

      <div className="safe-bottom border-t border-slate-200 bg-white px-4 py-4">
        {!added ? (
          <button
            type="button"
            disabled={!detected}
            onClick={handleAdd}
            className="w-full rounded-2xl bg-brand-500 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-brand-500/30 transition-opacity disabled:opacity-40"
          >
            Add to Inventory
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-2xl bg-brand-500 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-brand-500/30 active:scale-[0.99]"
            >
              Add Another Product
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-2xl border border-slate-200 px-5 py-3.5 text-[15px] font-medium text-slate-600"
            >
              Home
            </button>
          </div>
        )}
      </div>
    </Screen>
  )
}

function Row({ label, children }: { label: string; editing: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{children}</dd>
    </div>
  )
}
