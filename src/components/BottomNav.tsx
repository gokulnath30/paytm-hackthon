import { NavLink } from 'react-router-dom'
import { HomeIcon, CartIcon, ChartIcon } from './icons'

const tabs = [
  { to: '/', label: 'Assistant', Icon: HomeIcon, end: true },
  { to: '/bill/new', label: 'New Bill', Icon: CartIcon, end: true },
  { to: '/insights', label: 'Insights', Icon: ChartIcon, end: true },
]

export function BottomNav() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-10 flex border-t border-slate-200 bg-white/95 backdrop-blur">
      {tabs.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              isActive ? 'text-brand-500' : 'text-slate-400'
            }`
          }
        >
          <Icon width={20} height={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
