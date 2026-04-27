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
    <div className="glass-card rounded-2xl p-3 flex items-center gap-4">
      {/* Cashier */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
          {cashierName[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="text-[13px] font-bold text-text-primary leading-tight">{cashierName.split(' ')[0]}</p>
          <p className="text-[10px] text-text-muted leading-tight">📍 {branchName}</p>
        </div>
      </div>

      <div className="w-px h-9 bg-border-subtle" />

      {/* Stats */}
      <Stat label="Принято" value={stats.paid} accent="emerald" />
      <Stat label="Активные" value={stats.active} accent="amber" />
      <Stat label="Всего" value={stats.total} />

      <div className="flex-1" />

      {/* Revenue */}
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">Выручка за смену</p>
        <p className="text-xl font-bold text-emerald-400 tabular-nums">
          {stats.revenue.toLocaleString('ru-RU')} <span className="text-xs font-normal text-text-muted">сум</span>
        </p>
      </div>

      <div className="w-px h-9 bg-border-subtle" />

      {/* Time */}
      <div className="text-right shrink-0">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">Время</p>
        <p className="text-base font-bold text-text-primary tabular-nums">{time}</p>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: 'emerald' | 'amber' }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-text-muted leading-tight">{label}</p>
      <p className={[
        'text-lg font-bold tabular-nums leading-tight',
        accent === 'emerald' ? 'text-emerald-400' :
        accent === 'amber' ? 'text-amber-400' :
        'text-text-primary',
      ].join(' ')}>{value}</p>
    </div>
  )
}
