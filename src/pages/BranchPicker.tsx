import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBranches, getBranch } from '@/api/branches'
import { useSessionStore } from '@/store/sessionStore'
import { PageSpinner, Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { ToastContainer, toast } from '@/components/ui/Toast'

export default function BranchPicker() {
  const navigate = useNavigate()
  const { user, token, branch, setBranch, clear } = useSessionStore()

  // Auth guard
  useEffect(() => {
    if (!token || !user) navigate('/login', { replace: true })
  }, [token, user])

  // Если у пользователя задан branch_id — загружаем автоматически
  const userBranchQuery = useQuery({
    queryKey: ['branch', user?.branch_id],
    queryFn: () => getBranch(user!.branch_id!),
    enabled: !!user?.branch_id && !branch,
  })

  useEffect(() => {
    if (userBranchQuery.data) {
      setBranch(userBranchQuery.data)
      navigate('/workspace', { replace: true })
    }
  }, [userBranchQuery.data])

  // Для superadmin загружаем все филиалы
  const branchesQuery = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
    enabled: !!user && !user.branch_id,
  })

  if (branch) {
    navigate('/workspace', { replace: true })
    return null
  }

  if (userBranchQuery.isLoading || branchesQuery.isLoading) return <PageSpinner />

  // Если филиал выбран — переходим автоматически
  if (user?.branch_id && !userBranchQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
        <Spinner size={32} />
        <p className="text-text-muted">Загрузка филиала...</p>
      </div>
    )
  }

  const handlePick = (b: any) => {
    setBranch(b)
    toast.success(`Филиал «${b.name}» выбран`)
    navigate('/workspace', { replace: true })
  }

  const handleLogout = () => {
    clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-8 pb-6 safe-top">
      <ToastContainer />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Выберите филиал</h1>
        <p className="text-sm text-text-muted mt-1">В каком филиале вы работаете?</p>
      </div>

      <div className="flex-1 space-y-3 max-w-md mx-auto w-full">
        {branchesQuery.data?.map((b: any) => (
          <button
            key={b.id}
            onClick={() => handlePick(b)}
            disabled={!b.is_active}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-lg font-bold shrink-0">
              {b.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text-primary truncate">{b.name}</p>
              {b.address && <p className="text-xs text-text-muted mt-0.5 truncate">{b.address}</p>}
              {!b.is_active && (
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-status-cancel/20 text-status-cancel">
                  Закрыт
                </span>
              )}
            </div>
            <svg className="text-text-muted shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        {branchesQuery.data?.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            Филиалы не найдены
          </div>
        )}
      </div>

      <Button variant="ghost" block onClick={handleLogout} className="mt-6">
        Выйти
      </Button>
    </div>
  )
}
