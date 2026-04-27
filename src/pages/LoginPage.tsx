import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useSessionStore } from '@/store/sessionStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast, ToastContainer } from '@/components/ui/Toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, token, user } = useSessionStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  // Если уже авторизован
  useEffect(() => {
    if (token && user) navigate('/workspace', { replace: true })
  }, [token, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Введите email и пароль')
      return
    }
    setLoading(true)
    try {
      const res = await login(email, password)
      // Доступ только для operator (кассир), branch_admin или superadmin
      if (!['operator', 'branch_admin', 'superadmin'].includes(res.user.role)) {
        toast.error('У вас нет доступа к кассовой панели')
        return
      }
      setAuth(res.access_token, res.user)
      toast.success(`Добро пожаловать, ${res.user.full_name.split(' ')[0]}!`)
      navigate('/branch', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Неверный email или пароль'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh px-6 pb-8 safe-top">
      <ToastContainer />

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M2 10h20M6 14h2M10 14h4" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/30 blur-2xl -z-10" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary">Касса</h1>
          <p className="text-sm text-text-muted mt-1">KafeBar — приём оплат</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 mt-4">
          <Input
            type="email"
            label="Email"
            placeholder="kassir@kafebar.uz"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            type={showPwd ? 'text' : 'password'}
            label="Пароль"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            suffix={
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="text-text-muted text-xs"
              >
                {showPwd ? '👁' : '👁‍🗨'}
              </button>
            }
          />
          <Button type="submit" block size="lg" loading={loading}>
            Войти
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-text-dim mt-6">
        Только для авторизованных кассиров · v1.0
      </p>
    </div>
  )
}
