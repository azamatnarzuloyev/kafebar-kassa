import { useMemo } from 'react'
import type { Order } from '@/types/api'

interface Props {
  orders: Order[]   // full list (today)
  branchName: string
  cashierName: string
}

export function DailySessionBar({ orders, branchName, cashierName }: Props) {
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayOrders = orders.filter(o => o.created_at.startsWith(today))
    const paid = todayOrders.filter(o => o.status === 'paid' || o.payment_status === 'paid')
    const revenue = paid.reduce((s, o) => s + Number(o.total), 0)
    return {
      total: todayOrders.length,
      paid: paid.length,
      revenue,
      active: todayOrders.filter(o => ['pending', 'accepted'].includes(o.status)).length,
    }
  }, [orders])

  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-5 whitespace-nowrap">
      {/* Cashier */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base">
          {cashierName[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="leading-tight">
          <p className="text-[14px] font-bold text-text-primary">{cashierName.split(' ')[0]}</p>
          <p className="text-[11px] text-text-muted">📍 {branchName}</p>
        </div>
      </div>

      <div className="w-px h-10 bg-border-subtle shrink-0" />

      {/* Stats */}
      <Stat label="Принято" value={stats.paid} accent="emerald" />
      <Stat label="Активные" value={stats.active} accent="amber" />
      <Stat label="Всего" value={stats.total} />

      <div className="flex-1" />

      {/* Revenue */}
      <div className="text-right shrink-0 leading-tight">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">Выручка за смену</p>
        <p className="text-xl font-bold text-emerald-400 tabular-nums">
          {stats.revenue.toLocaleString('ru-RU')} <span className="text-xs font-normal text-text-muted">сум</span>
        </p>
      </div>

      <div className="w-px h-10 bg-border-subtle shrink-0" />

      {/* Time */}
      <div className="text-right shrink-0 leading-tight">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">Время</p>
        <p className="text-lg font-bold text-text-primary tabular-nums">{time}</p>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: 'emerald' | 'amber' }) {
  return (
    <div className="shrink-0 leading-tight">
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className={[
        'text-xl font-bold tabular-nums',
        accent === 'emerald' ? 'text-emerald-400' :
        accent === 'amber' ? 'text-amber-400' :
        'text-text-primary',
      ].join(' ')}>{value}</p>
    </div>
  )
}
