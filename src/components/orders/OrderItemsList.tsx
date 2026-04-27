import type { Order } from '@/types/api'

interface Props { order: Order }

const ZONE: Record<string, string> = { hall: 'Зал', terrace: 'Терраса', vip: 'VIP' }

export function OrderItemsList({ order }: Props) {
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle flex items-start gap-3 shrink-0">
        <div className={[
          'w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0',
          order.status === 'pending' ? 'bg-amber-500 text-white' :
          order.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
          'bg-emerald-500/20 text-emerald-400',
        ].join(' ')}>
          {order.table_number ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-text-primary">
            Стол {order.table_number}
            {order.zone && (
              <span className="ml-2 text-[12px] font-normal text-text-muted bg-white/5 px-2 py-0.5 rounded-full align-middle">
                {ZONE[order.zone] ?? order.zone}
              </span>
            )}
          </h2>
          <p className="text-[12px] text-text-muted font-mono mt-0.5">
            #{order.id.slice(-6).toUpperCase()} · {totalQty} товаров
          </p>
          {order.customer_phone && (
            <p className="text-[12px] text-text-muted mt-0.5">
              📞 {order.customer_phone}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
        {order.items.map(item => (
          <div key={item.id} className="glass-card rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              ×{item.quantity}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary text-[14px]">
                {item.product_name}
              </p>
              {item.modifiers.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.modifiers.map(m => (
                    <span key={m.id} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
                      + {m.option_name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-text-muted mt-1">
                {(+item.unit_price).toLocaleString('ru-RU')} × {item.quantity}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-text-primary">
                {(+item.item_total).toLocaleString('ru-RU')}
              </p>
              <p className="text-[10px] text-text-muted">сум</p>
            </div>
          </div>
        ))}

        {order.note && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
              Комментарий клиента
            </p>
            <p className="text-[13px] text-text-primary italic">"{order.note}"</p>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 border-t border-border-subtle space-y-1.5 shrink-0">
        <div className="flex justify-between text-sm text-text-muted">
          <span>Промежуточный итог</span>
          <span>{(+order.subtotal).toLocaleString('ru-RU')} сум</span>
        </div>
        {+order.cashback_used > 0 && (
          <div className="flex justify-between text-sm text-emerald-400 font-medium">
            <span>💰 Кешбэк (использовано)</span>
            <span>−{(+order.cashback_used).toLocaleString('ru-RU')} сум</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-border-subtle">
          <span className="text-base font-semibold text-text-primary">Итого</span>
          <span className="text-2xl font-bold text-text-primary">
            {(+order.total).toLocaleString('ru-RU')}
            <span className="text-sm font-normal text-text-muted ml-1">сум</span>
          </span>
        </div>
      </div>
    </div>
  )
}
