import { useEffect, useRef, useState } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL as string

export type WSEvent =
  | { event: 'order.new'; data: any }
  | { event: 'order.created'; data: any }
  | { event: 'order.status_changed'; data: { order_id: string; status: string } }
  | { event: 'order.cancelled'; data: { order_id: string } }

interface Options {
  branchId: string | null | undefined
  onEvent: (e: WSEvent) => void
}

export function useWaiterWS({ branchId, onEvent }: Options) {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const onEventRef = useRef(onEvent)

  // Latest callback (state stale bo'lmasligi uchun)
  useEffect(() => { onEventRef.current = onEvent }, [onEvent])

  useEffect(() => {
    if (!branchId) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      if (cancelled) return
      const ws = new WebSocket(`${WS_URL}/ws/waiter/${branchId}`)
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) { ws.close(); return }
        setConnected(true)
        retriesRef.current = 0
      }

      ws.onclose = () => {
        setConnected(false)
        if (cancelled) return
        retriesRef.current++
        const delay = Math.min(retriesRef.current * 1000, 10_000)
        timer = setTimeout(connect, delay)
      }

      ws.onerror = () => ws.close()

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as WSEvent
          onEventRef.current(data)
        } catch { /* ignore */ }
      }
    }

    connect()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [branchId])

  return { connected }
}
