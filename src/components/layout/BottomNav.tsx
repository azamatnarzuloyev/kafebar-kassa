import { NavLink } from 'react-router-dom'

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4m-9 14V11M3 7v13a1 1 0 001 1h16a1 1 0 001-1V7" />
  </svg>
)

const StatsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14l4-4 4 4 6-6" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const items = [
  { to: '/orders',   label: 'Заказы',      Icon: HomeIcon },
  { to: '/stats',    label: 'Статистика',  Icon: StatsIcon },
  { to: '/settings', label: 'Настройки',   Icon: SettingsIcon },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[720px] safe-bottom z-30 border-t border-border-subtle"
      style={{ background: 'rgba(11, 15, 26, 0.92)', backdropFilter: 'blur(16px)' }}
    >
      <div className="flex">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors',
                isActive ? 'text-brand-400' : 'text-text-muted',
              ].join(' ')
            }
          >
            <Icon />
            <span className="text-[11px] font-semibold">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
