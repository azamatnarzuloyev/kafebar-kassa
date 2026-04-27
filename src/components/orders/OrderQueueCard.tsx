import { useElapsed } from '@/hooks/useElapsed'
import type { Order } from '@/types/api'

const ZONE: Record<string, string> = { hall: 'Зал', terrace: 'Терраса', vip: 'VIP' }

interface Props {
  order: Order
  selected: boolean
  onClick: () => void
}

export function OrderQueueCard({ order, selected, onClick }: Props) {
  const { text: elapsed, isUrgent } = useElapsed(order.created_at)
  const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0)
  const isPending = order.status === 'pending'

  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-2xl px-3 py-2.5 transition-all',
        'flex items-center gap-3',
        selected
          ? 'bg-emerald-500/15 ring-2 ring-emerald-500'
          : 'glass-card active:scale-[0.99]',
        isPending && !selected ? 'ring-1 ring-amber-500/40' : '',
      ].join(' ')}
    >
      {/* Table bubble */}
      <div className={[
        'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0',
        isPending ? 'bg-amber-500 text-white' :
        order.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
        'bg-white/5 text-text-muted',
      ].join(' ')}>
        {order.table_number ?? '?'}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-text-primary text-[14px] truncate">
            Стол {order.table_number}
          </p>
          {order.zone && (
            <span className="text-[10px] text-text-muted bg-white/5 px-1.5 py-0.5 rounded-full shrink-0">
              {ZONE[order.zone] ?? order.zone}
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5">
          <span className="font-mono">#{order.id.slice(-6).toUpperCase()}</span>
          <span>·</span>
          <span>{itemsCount} шт.</span>
          <span>·</span>
          <span className={isUrgent ? 'text-amber-400 font-semibold' : ''}>{elapsed}</span>
        </p>
      </div>

      {/* Total */}
      <div className="text-right shrink-0">
        <p className="font-bold text-text-primary">
          {(+order.total).toLocaleString('ru-RU')}
        </p>
        <p className="text-[10px] text-text-muted">сум</p>
      </div>
    </button>
  )
}
