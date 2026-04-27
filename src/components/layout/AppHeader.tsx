import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/store/sessionStore'

interface Props {
  connected: boolean
  onSettings?: () => void
}

export function AppHeader({ connected, onSettings }: Props) {
  const navigate = useNavigate()
  const { user, branch } = useSessionStore()

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b border-border-subtle"
            style={{ background: 'rgba(11, 15, 26, 0.92)' }}>
      <div className="px-4 py-3 flex items-center gap-3 safe-top">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
          {user?.full_name[0]?.toUpperCase() ?? '?'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-text-primary text-[15px] truncate">
              {user?.full_name?.split(' ')[0] ?? 'Официант'}
            </p>
            <span className={[
              'inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
              connected
                ? 'bg-accent-green-bg text-accent-green'
                : 'bg-accent-red-bg text-accent-red',
            ].join(' ')}>
              <span className={[
                'w-1.5 h-1.5 rounded-full',
                connected ? 'bg-accent-green animate-pulse' : 'bg-accent-red',
              ].join(' ')} />
              {connected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          {branch && (
            <p className="text-[11px] text-text-muted truncate flex items-center gap-1 mt-0.5">
              <span>📍</span> {branch.name}
            </p>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => onSettings ? onSettings() : navigate('/settings')}
          className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-text-muted active:scale-95 transition-transform"
          aria-label="Настройки"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
