import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Wordmark } from '../components/Brand'
import { AgentAvatar, StatTile } from '../components/ui'
import { AlertIcon, BellIcon, ChevronDownIcon, StoreIcon, SunIcon, UsersIcon } from '../components/icons'
import { agents, dashboardCounts, dashboardStats, store } from '../lib/mockData'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <AppShell
      showBack={false}
      width="wide"
      /* The nav rail already carries the wordmark from tablet width up */
      header={
        <div className="min-w-0 flex-1">
          <span className="md:hidden">
            <Wordmark size="sm" />
          </span>
          <h1 className="hidden text-lg font-semibold text-ink md:block">Home</h1>
        </div>
      }
      headerRight={
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas"
        >
          <BellIcon width={20} height={20} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-bad ring-2 ring-surface" />
        </button>
      }
    >
      <button
        type="button"
        className="mb-4 flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-base font-medium text-ink transition-colors hover:bg-canvas"
      >
        <StoreIcon width={18} height={18} className="shrink-0 text-brand-600" />
        <span className="truncate">{store.name}</span>
        <ChevronDownIcon width={16} height={16} className="shrink-0 text-ink-faint" />
      </button>

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-warn/20 bg-warn-bg px-4 py-3.5">
        <SunIcon width={24} height={24} className="shrink-0 text-warn" />
        <div className="min-w-0">
          <p className="text-base font-semibold text-warn">{store.ownerGreeting}</p>
          <p className="truncate text-sm text-warn/80">{store.greetingSub}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {dashboardStats.map((s) => (
          <StatTile key={s.id} label={s.label} value={s.value} delta={s.delta} />
        ))}
        <StatTile label={dashboardCounts[0].label} value={dashboardCounts[0].value} icon={UsersIcon} />
        <StatTile label={dashboardCounts[1].label} value={dashboardCounts[1].value} icon={AlertIcon} tone="bad" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => navigate(agent.route)}
            className={`flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-colors ${
              agent.tone === 'brand'
                ? 'border-brand-200 bg-brand-50 hover:bg-brand-100'
                : 'border-leaf-100 bg-leaf-50 hover:bg-leaf-100'
            }`}
          >
            <AgentAvatar tone={agent.tone} />
            <span>
              <span className="block text-base font-semibold text-ink">{agent.name}</span>
              <span className="mt-0.5 block text-sm text-ink-soft">{agent.shortDesc}</span>
            </span>
          </button>
        ))}
      </div>
    </AppShell>
  )
}
