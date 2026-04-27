import { useEffect, useRef } from 'react'
import { useSessionStore } from '@/store/sessionStore'

/**
 * Трёхуровневый сигнал при новом заказе:
 * 1. Audio (mp3 — public/sounds/new-order.wav)
 * 2. Вибрация (Android)
 * 3. Browser Notification (даже когда приложение закрыто)
 */
export function useNotifier() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { soundEnabled, vibrationEnabled, notificationsEnabled } = useSessionStore()

  // Предзагружаем аудио
  useEffect(() => {
    audioRef.current = new Audio('/sounds/new-order.wav')
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 0.8
  }, [])

  const notify = (title: string, body: string, options: { force?: boolean } = {}) => {
    // 1. Sound
    if (soundEnabled || options.force) {
      audioRef.current?.play().catch(() => {})
    }

    // 2. Vibration
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }

    // 3. Browser notification (только если есть разрешение)
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'new-order',
          requireInteraction: false,
        })
      } catch { /* ignore */ }
    }
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  return { notify, requestPermission }
}
