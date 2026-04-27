import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionStore } from '@/store/sessionStore'
import { getActiveOrders, getBranchOrders, getOrder } from '@/api/orders'
import { useWaiterWS } from '@/hooks/useWaiterWS'
import { useNotifier } from '@/hooks/useNotifier'
import { OrderQueueCard } from '@/components/orders/OrderQueueCard'
import { OrderItemsList } from '@/components/orders/OrderItemsList'
import { PaymentWorkspace } from '@/components/payment/PaymentWorkspace'
import { DailySessionBar } from '@/components/session/DailySessionBar'
import { QRScanner } from '@/components/scan/QRScanner'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ToastContainer, toast } from '@/components/ui/Toast'
import type { Order } from '@/types/api'

type Filter = 'pending' | 'unpaid' | 'all'

export default function WorkspacePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const branch = useSessionStore(s => s.branch)
  const user = useSessionStore(s => s.user)
  const { notify, requestPermission } = useNotifier()

  const [filter, setFilter] = useState<Filter>('unpaid')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      requestPermission()
    }
  }, [])

  // Active orders (pending + accepted)
  const activeQ = useQuery({
    queryKey: ['kassa-orders', 'active', branch?.id],
    queryFn: () => getActiveOrders(branch!.id),
    enabled: !!branch?.id,
    refetchInterval: 15_000,
    staleTime: 0,
  })

  // Today's full list (for stats + recent paid)
  const todayQ = useQuery({
    queryKey: ['kassa-orders', 'today', branch?.id],
    queryFn: () => getBranchOrders(branch!.id, { limit: 100 }),
    enabled: !!branch?.id,
    refetchInterval: 30_000,
  })

  // Real-time
  const { connected } = useWaiterWS({
    branchId: branch?.id ?? null,
    onEvent: (e) => {
      if (e.event === 'order.new' || e.event === 'order.created') {
        const tableNum = e.data?.table_number ?? '?'
        notify('🔔 Новый заказ!', `Стол ${tableNum}`)
        toast.info(`Новый заказ: стол ${tableNum}`)
        qc.invalidateQueries({ queryKey: ['kassa-orders'] })
      }
      if (e.event === 'order.status_changed') {
        qc.invalidateQueries({ queryKey: ['kassa-orders'] })
      }
    },
  })

  const allOrders = useMemo(() => {
    const a = activeQ.data ?? []
    const t = todayQ.data ?? []
    const map = new Map<string, Order>()
    ;[...a, ...t].forEach(o => map.set(o.id, o))
    return Array.from(map.values()).sort((x, y) =>
      new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
    )
  }, [activeQ.data, todayQ.data])

  const filteredQueue = useMemo(() => {
    let list = allOrders
    if (filter === 'pending') list = list.filter(o => o.status === 'pending')
    else if (filter === 'unpaid') list = list.filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled')
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(o =>
        o.id.slice(-6).toUpperCase().includes(q.toUpperCase()) ||
        (o.table_number ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [allOrders, filter, search])

  const counts = useMemo(() => ({
    pending: allOrders.filter(o => o.status === 'pending').length,
    unpaid: allOrders.filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled').length,
    all: allOrders.length,
  }), [allOrders])

  // Auto-select first order if nothing selected
  useEffect(() => {
    if (!selectedId && filteredQueue.length > 0) {
      setSelectedId(filteredQueue[0].id)
    }
    // If selected order is no longer in list, deselect
    if (selectedId && !allOrders.find(o => o.id === selectedId)) {
      setSelectedId(filteredQueue[0]?.id ?? null)
    }
  }, [filteredQueue, selectedId, allOrders])

  const selectedOrder = useMemo(
    () => allOrders.find(o => o.id === selectedId) ?? null,
    [allOrders, selectedId]
  )

  // QR scan result
  const handleScanResult = async (text: string) => {
    setScannerOpen(false)
    const cleaned = text.trim()
    if (!cleaned) {
      toast.error('Не удалось прочитать QR-код')
      return
    }
    try {
      let order: Order | null = null
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleaned)) {
        order = await getOrder(cleaned)
      } else {
        const short = cleaned.toUpperCase().slice(-6)
        order = allOrders.find(o => o.id.slice(-6).toUpperCase() === short) ?? null
      }
      if (!order) {
        toast.error('Заказ не найден')
        return
      }
      if (order.payment_status === 'paid') {
        toast.warning('Этот заказ уже оплачен')
      }
      if (order.status === 'cancelled') {
        toast.error('Заказ отменён')
        return
      }
      setSelectedId(order.id)
      toast.success(`Заказ #${order.id.slice(-6).toUpperCase()} открыт`)
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message ?? 'Заказ не найден')
    }
  }

  if (!branch || !user) return null

  return (
    <div className="h-dvh flex flex-col bg-gradient-app overflow-hidden">
      <ToastContainer />

      {/* Top bar: session + actions */}
      <div className="px-3 pt-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <DailySessionBar
            orders={todayQ.data ?? []}
            branchName={branch.name}
            cashierName={user.full_name}
          />
        </div>

        <button
          onClick={() => setScannerOpen(true)}
          aria-label="Сканировать QR"
          title="Сканировать QR-код клиента"
          className="h-[64px] px-5 rounded-2xl bg-emerald-500 text-white font-bold flex items-center gap-2.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform shrink-0 hover:bg-emerald-600"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3M21 14v7M14 21h3" />
          </svg>
          <span>Сканировать QR</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          aria-label="Настройки"
          className="h-[64px] w-[64px] rounded-2xl glass-card flex items-center justify-center text-text-muted active:scale-95 transition-transform shrink-0 hover:bg-white/[0.08]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Main 3-column workspace */}
      <div className="flex-1 grid gap-3 p-3 min-h-0"
           style={{ gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr) minmax(420px, 480px)' }}>
        {/* LEFT — Orders queue */}
        <aside className="flex flex-col gap-3 min-h-0">
          {/* Filter tabs */}
          <div className="flex gap-2">
            <FilterChip label="Все" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterChip label="К оплате" count={counts.unpaid} active={filter === 'unpaid'} onClick={() => setFilter('unpaid')} accent="emerald" />
            <FilterChip label="Новые" count={counts.pending} active={filter === 'pending'} onClick={() => setFilter('pending')} accent="amber" />
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="# или № стола"
              className="input-dark w-full h-10 pl-9 pr-3 rounded-xl text-[13px]"
            />
          </div>

          {/* Connection indicator */}
          <div className={[
            'flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full self-start',
            connected ? 'bg-accent-green-bg text-accent-green' : 'bg-accent-red-bg text-accent-red',
          ].join(' ')}>
            <span className={['w-1.5 h-1.5 rounded-full', connected ? 'bg-accent-green animate-pulse' : 'bg-accent-red'].join(' ')} />
            {connected ? 'Связь установлена' : 'Нет связи'}
          </div>

          {/* Queue */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
            {(activeQ.isLoading || todayQ.isLoading) ? (
              <div className="flex justify-center py-10"><Spinner size={24} /></div>
            ) : filteredQueue.length === 0 ? (
              <EmptyState
                icon={<span>📋</span>}
                title={filter === 'pending' ? 'Новых заказов нет' : 'Заказов нет'}
                description={search ? 'Ничего не найдено' : 'Очередь пуста'}
              />
            ) : (
              filteredQueue.map(o => (
                <OrderQueueCard
                  key={o.id}
                  order={o}
                  selected={o.id === selectedId}
                  onClick={() => setSelectedId(o.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* CENTER — Order items */}
        <section className="glass-card rounded-2xl flex flex-col min-h-0 overflow-hidden">
          {selectedOrder ? (
            <OrderItemsList order={selectedOrder} />
          ) : (
            <EmptyState
              icon={<span className="text-7xl">🧾</span>}
              title="Выберите заказ"
              description="Слева в очереди или отсканируйте QR-код клиента"
            />
          )}
        </section>

        {/* RIGHT — Payment workspace */}
        <section className="glass-card rounded-2xl p-3 min-h-0 overflow-hidden">
          {selectedOrder ? (
            <PaymentWorkspace
              order={selectedOrder}
              onComplete={() => {
                qc.invalidateQueries({ queryKey: ['kassa-orders'] })
                setSelectedId(null)
              }}
            />
          ) : (
            <EmptyState
              icon={<span className="text-7xl">💳</span>}
              title="Касса готова"
              description="Выберите заказ, чтобы начать приём оплаты"
            />
          )}
        </section>
      </div>

      <QRScanner isOpen={scannerOpen} onClose={() => setScannerOpen(false)} onResult={handleScanResult} />
    </div>
  )
}

interface ChipProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
  accent?: 'emerald' | 'amber'
}

function FilterChip({ label, count, active, onClick, accent }: ChipProps) {
  const accentColor =
    accent === 'emerald' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40' :
    accent === 'amber'   ? 'bg-amber-500 text-white shadow-md shadow-amber-500/40' :
    'bg-white text-bg-start'
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-[12px] font-semibold transition-all',
        active ? accentColor : 'glass-card text-text-secondary',
      ].join(' ')}
    >
      <span className="truncate">{label}</span>
      <span className={[
        'min-w-[18px] h-4.5 px-1 rounded-full text-[10px] flex items-center justify-center font-bold',
        active ? 'bg-white/25' : 'bg-white/10 text-text-muted',
      ].join(' ')}>
        {count}
      </span>
    </button>
  )
}
