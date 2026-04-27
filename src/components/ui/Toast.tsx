import { useEffect, useState } from 'react'
import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastStore {
  toasts: Toast[]
  push: (type: ToastType, message: string) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (type, message) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 3000)
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

export const toast = {
  success: (msg: string) => useToastStore.getState().push('success', msg),
  error:   (msg: string) => useToastStore.getState().push('error', msg),
  info:    (msg: string) => useToastStore.getState().push('info', msg),
  warning: (msg: string) => useToastStore.getState().push('warning', msg),
}

const COLORS: Record<ToastType, string> = {
  success: 'bg-status-ready text-white',
  error:   'bg-status-cancel text-white',
  info:    'bg-status-accepted text-white',
  warning: 'bg-status-pending text-white',
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ⓘ',
  warning: '⚠',
}

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)
  const remove = useToastStore(s => s.remove)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          className={[
            'pointer-events-auto px-4 py-3 rounded-2xl shadow-2xl min-w-[280px] max-w-[400px]',
            'flex items-center gap-3 animate-slide-up',
            COLORS[t.type],
          ].join(' ')}
        >
          <span className="text-lg font-bold">{ICONS[t.type]}</span>
          <span className="flex-1 text-sm font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
