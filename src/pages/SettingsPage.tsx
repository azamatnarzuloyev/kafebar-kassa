import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/store/sessionStore'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  const navigate = useNavigate()
  const {
    user, branch, clear,
    soundEnabled, setSoundEnabled,
    vibrationEnabled, setVibrationEnabled,
    notificationsEnabled, setNotificationsEnabled,
  } = useSessionStore()

  const handleLogout = () => {
    if (confirm('Подтверждаете выход из аккаунта?')) {
      clear()
      navigate('/login', { replace: true })
    }
  }

  const handleChangeBranch = () => {
    useSessionStore.getState().setBranch(null)
    navigate('/branch', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-gradient-app">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b border-border-subtle bg-bg-start/90">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/workspace')}
            className="w-11 h-11 rounded-xl glass-card flex items-center justify-center text-text-muted active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Настройки</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {/* Profile card */}
        <section className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text-primary text-lg truncate">{user?.full_name}</p>
            <p className="text-sm text-text-muted truncate">{user?.email}</p>
            <span className="inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
              {user?.role === 'operator' ? 'КАССИР' :
               user?.role === 'branch_admin' ? 'АДМИН ФИЛИАЛА' :
               user?.role === 'superadmin' ? 'SUPERADMIN' :
               user?.role?.toUpperCase()}
            </span>
          </div>
        </section>

        {/* Branch */}
        <section className="glass-card rounded-2xl">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted">Филиал</p>
              <p className="font-bold text-text-primary mt-0.5 text-lg">{branch?.name ?? '—'}</p>
            </div>
            <Button size="md" variant="ghost" onClick={handleChangeBranch}>
              Сменить
            </Button>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-[11px] uppercase tracking-wider text-text-muted mb-2 px-1">
            Уведомления
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-border-subtle">
            <ToggleRow
              icon="🔊"
              label="Звук"
              description="Звуковой сигнал при поступлении нового заказа"
              value={soundEnabled}
              onChange={setSoundEnabled}
            />
            <ToggleRow
              icon="📳"
              label="Вибрация"
              description="Работает только на мобильных устройствах"
              value={vibrationEnabled}
              onChange={setVibrationEnabled}
            />
            <ToggleRow
              icon="🔔"
              label="Push-уведомления"
              description="Уведомления браузера, даже когда вкладка свёрнута"
              value={notificationsEnabled}
              onChange={async (v) => {
                if (v && Notification.permission !== 'granted') {
                  const result = await Notification.requestPermission()
                  if (result !== 'granted') return
                }
                setNotificationsEnabled(v)
              }}
            />
          </div>
        </section>

        {/* About */}
        <section className="glass-card rounded-2xl px-5 py-4 text-sm text-text-muted flex items-center justify-between">
          <div>
            <p className="font-semibold text-text-primary">KafeBar — Касса</p>
            <p className="text-text-dim text-[12px] mt-0.5">v1.0.0 · 2026</p>
          </div>
          <span className="text-2xl">💳</span>
        </section>

        {/* Logout */}
        <Button block variant="danger" size="lg" onClick={handleLogout}>
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  )
}

interface ToggleProps {
  icon: string
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ icon, label, description, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-primary text-[15px]">{label}</p>
        {description && <p className="text-[12px] text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className={[
          'relative shrink-0 inline-flex items-center rounded-full transition-colors',
          'h-7 w-[52px] p-0.5',
          value ? 'bg-emerald-500' : 'bg-white/15',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ease-out',
            value ? 'translate-x-[22px]' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
