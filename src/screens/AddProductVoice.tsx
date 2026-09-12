import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/ui'
import { MicIcon } from '../components/icons'
import { addProductVoice } from '../lib/mockData'

const BAR_HEIGHTS = [10, 18, 28, 16, 34, 22, 12, 26, 36, 20, 14, 30, 18, 24, 10, 28, 16, 22, 12, 20]

export default function AddProductVoice() {
  const navigate = useNavigate()

  return (
    <AppShell
      title={addProductVoice.title}
      subtitle={addProductVoice.subtitle}
      showNav={false}
      footer={
        <Button variant="secondary" className="w-full" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-7 py-6 sm:py-10">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-brand-50" />
          <span className="absolute inset-5 rounded-full bg-brand-100" />
          <span className="relative flex h-20 w-20 animate-mic-pulse items-center justify-center rounded-full bg-brand-500 text-white">
            <MicIcon width={30} height={30} />
          </span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-semibold text-ink">{addProductVoice.listeningLabel}</p>

          <div className="flex h-10 items-center gap-1" aria-hidden="true">
            {BAR_HEIGHTS.map((h, i) => (
              <span
                key={i}
                className="animate-wave w-1 rounded-full bg-brand-400"
                style={{ height: `${h}px`, animationDelay: `${i * 0.06}s` }}
              />
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm rounded-xl border border-hairline bg-surface px-4 py-3.5 text-center">
          <p className="text-sm font-medium text-ink-soft">{addProductVoice.tipLabel}</p>
          <p className="mt-1 text-base text-ink">{addProductVoice.tipExample}</p>
        </div>
      </div>
    </AppShell>
  )
}
