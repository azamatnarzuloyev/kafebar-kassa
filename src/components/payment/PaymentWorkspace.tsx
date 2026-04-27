import { useState, useEffect, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recordPayment, updateOrderStatus } from '@/api/orders'
import { toast } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import type { Order } from '@/types/api'

type Method = 'cash' | 'card' | 'wallet'

interface Props {
  order: Order
  onComplete: () => void
}

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000]

export function PaymentWorkspace({ order, onComplete }: Props) {
  const qc = useQueryClient()
  const total = Number(order.total)
  const isPending = order.status === 'pending'
  const isPaid = order.payment_status === 'paid'

  const [method, setMethod] = useState<Method>('cash')
  const [received, setReceived] = useState<string>('')

  // Reset on order change
  useEffect(() => {
    setMethod('cash')
    setReceived('')
  }, [order.id])

  const receivedNum = useMemo(() => {
    const n = Number(received.replace(/\s/g, '')) || 0
    return n
  }, [received])

  const change = method === 'cash' ? Math.max(0, receivedNum - total) : 0
  const isInsufficient = method === 'cash' && receivedNum > 0 && receivedNum < total
  const canConfirm = !isPaid && (method !== 'cash' || receivedNum >= total)

  const acceptMut = useMutation({
    mutationFn: () => updateOrderStatus(order.id, 'accepted'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kassa-orders'] })
      toast.success('Заказ принят')
    },
    onError: () => toast.error('Не удалось принять заказ'),
  })

  const payMut = useMutation({
    mutationFn: () => recordPayment({
      order_id: order.id,
      amount: total,
      method,
    }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['kassa-orders'] })
      const cashback = data?.cashback_earned ?? 0
      toast.success(
        cashback > 0
          ? `Оплата принята · Кешбэк +${Number(cashback).toLocaleString('ru-RU')} сум`
          : 'Оплата принята',
      )
      setReceived('')
      onComplete()
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.error?.message ?? 'Не удалось принять оплату'
      toast.error(msg)
    },
  })

  const handleNumpad = (v: string) => {
    if (v === 'C') {
      setReceived('')
      return
    }
    if (v === '←') {
      setReceived(prev => prev.slice(0, -1))
      return
    }
    if (v === '000') {
      setReceived(prev => prev === '' ? '' : prev + '000')
      return
    }
    setReceived(prev => prev + v)
  }

  const handleQuickAmount = (n: number) => {
    setReceived(String(n))
  }

  const handleExact = () => {
    setReceived(String(total))
  }

  const formattedReceived = receivedNum > 0 ? receivedNum.toLocaleString('ru-RU') : ''

  // Display
  return (
    <div className="h-full flex flex-col gap-3">
      {/* Top: Order summary + total */}
      <div className="rounded-2xl px-5 py-4 relative overflow-hidden shrink-0"
           style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-end justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">К оплате</p>
            <p className="text-4xl font-bold text-white mt-1 tabular-nums truncate">
              {total.toLocaleString('ru-RU')}
              <span className="text-base font-medium text-white/80 ml-2">сум</span>
            </p>
          </div>
          <div className="text-right shrink-0 leading-tight">
            <p className="font-mono text-white/80 text-sm">#{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-white/90 text-sm font-semibold mt-1 whitespace-nowrap">
              Стол {order.table_number}
              {order.zone ? ` · ${order.zone}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Pending warning */}
      {isPending && (
        <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-3 flex items-center gap-3 shrink-0">
          <span className="text-2xl">⚠</span>
          <div className="flex-1">
            <p className="text-amber-400 font-semibold text-sm">Заказ ещё не принят</p>
            <p className="text-text-muted text-xs mt-0.5">Сначала примите заказ, затем принимайте оплату</p>
          </div>
          <button
            onClick={() => acceptMut.mutate()}
            disabled={acceptMut.isPending}
            className="px-4 h-10 rounded-xl bg-blue-500 text-white text-sm font-bold disabled:opacity-60 active:scale-95 transition-transform"
          >
            {acceptMut.isPending ? <Spinner size={16} className="border-current" /> : 'Принять'}
          </button>
        </div>
      )}

      {/* Already paid */}
      {isPaid && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-5 py-4 flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-2xl">
            ✓
          </div>
          <div>
            <p className="text-emerald-400 font-bold">Заказ оплачен</p>
            <p className="text-text-muted text-xs mt-0.5">Способ: {order.payment_method ?? '—'}</p>
          </div>
        </div>
      )}

      {/* Methods */}
      {!isPaid && (
        <div className="grid grid-cols-3 gap-2 shrink-0">
          {([
            { v: 'cash',   label: 'Наличные', icon: '💵' },
            { v: 'card',   label: 'Карта',    icon: '💳' },
            { v: 'wallet', label: 'Кешбэк',   icon: '👛' },
          ] as { v: Method; label: string; icon: string }[]).map(m => (
            <button
              key={m.v}
              onClick={() => setMethod(m.v)}
              className={[
                'h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 font-bold transition-all',
                method === m.v
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
                  : 'glass-card text-text-secondary hover:bg-white/[0.06]',
              ].join(' ')}
            >
              <span className="text-lg leading-none">{m.icon}</span>
              <span className="text-[12px] leading-none">{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Cash workspace: amount received + numpad */}
      {!isPaid && method === 'cash' && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Received amount display */}
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted">Принято от клиента</p>
              <p className="text-3xl font-bold text-text-primary mt-1 tabular-nums">
                {formattedReceived || '0'}
                <span className="text-base font-normal text-text-muted ml-2">сум</span>
              </p>
            </div>
            {change > 0 && (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-emerald-400">Сдача</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1 tabular-nums">
                  {change.toLocaleString('ru-RU')}
                </p>
              </div>
            )}
            {isInsufficient && (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-red-400">Не хватает</p>
                <p className="text-3xl font-bold text-red-400 mt-1 tabular-nums">
                  {(total - receivedNum).toLocaleString('ru-RU')}
                </p>
              </div>
            )}
          </div>

          {/* Quick amounts + Exact */}
          <div className="grid grid-cols-6 gap-1.5 shrink-0">
            <button
              onClick={handleExact}
              className="h-11 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-[13px] border border-emerald-500/30 active:scale-95 transition-transform whitespace-nowrap"
            >
              Ровно
            </button>
            {QUICK_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => handleQuickAmount(amt)}
                className="h-11 rounded-xl glass-card text-text-primary font-semibold text-sm active:scale-95 transition-transform hover:bg-white/[0.06]"
              >
                {amt >= 1_000_000 ? `${amt / 1_000_000}M` : `${amt / 1_000}K`}
              </button>
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
            {['7','8','9','4','5','6','1','2','3','000','0','←'].map(key => (
              <button
                key={key}
                onClick={() => handleNumpad(key)}
                className={[
                  'rounded-2xl text-3xl font-bold glass-card active:scale-95 transition-all hover:bg-white/[0.08]',
                  key === '←' ? 'text-amber-400' : 'text-text-primary',
                ].join(' ')}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card / Wallet — simpler */}
      {!isPaid && method !== 'cash' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-4">{method === 'card' ? '💳' : '👛'}</div>
            <p className="text-lg font-semibold text-text-primary">
              {method === 'card' ? 'Оплата картой' : 'Оплата с кешбэка'}
            </p>
            <p className="text-sm text-text-muted mt-2 max-w-xs">
              {method === 'card'
                ? 'Проведите карту через POS-терминал, затем подтвердите оплату.'
                : 'Сумма будет списана с кешбэк-баланса клиента.'}
            </p>
          </div>
        </div>
      )}

      {/* Confirm button */}
      {!isPaid && (
        <button
          onClick={() => payMut.mutate()}
          disabled={!canConfirm || payMut.isPending || isPending}
          className={[
            'w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shrink-0',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'active:scale-[0.98] shadow-lg',
            canConfirm
              ? 'bg-emerald-500 text-white shadow-emerald-500/40'
              : 'bg-white/10 text-text-muted',
          ].join(' ')}
        >
          {payMut.isPending ? (
            <Spinner size={22} className="border-current" />
          ) : (
            <span className="text-2xl">✓</span>
          )}
          {payMut.isPending ? 'Обработка...' : 'Подтвердить оплату'}
        </button>
      )}

      {/* Reset after paid */}
      {isPaid && (
        <button
          onClick={onComplete}
          className="w-full h-14 rounded-2xl bg-white/10 text-text-primary font-bold active:scale-[0.98] transition-transform shrink-0"
        >
          Закрыть
        </button>
      )}
    </div>
  )
}
