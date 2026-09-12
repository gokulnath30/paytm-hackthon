import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { AgentAvatar } from '../components/ui'
import { ChevronRightIcon } from '../components/icons'
import { agents, agentTagline } from '../lib/mockData'

export default function AgentSelect() {
  const navigate = useNavigate()

  return (
    <AppShell title="" width="narrow">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Choose Your Assistant</h1>
        <p className="mt-1 text-base text-ink-soft">What would you like to do?</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => navigate(agent.route)}
            className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-colors ${
              agent.tone === 'brand'
                ? 'border-brand-200 bg-brand-50 hover:bg-brand-100'
                : 'border-leaf-100 bg-leaf-50 hover:bg-leaf-100'
            }`}
          >
            <AgentAvatar tone={agent.tone} size="lg" />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold text-ink">{agent.fullName}</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{agent.longDesc}</span>
            </span>
            <ChevronRightIcon
              width={20}
              height={20}
              className={`mt-1 shrink-0 ${agent.tone === 'brand' ? 'text-brand-500' : 'text-leaf-500'}`}
            />
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-ink-faint">{agentTagline}</p>
    </AppShell>
  )
}
