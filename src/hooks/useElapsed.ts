import { useEffect, useState } from 'react'

export function useElapsed(startISO: string): { text: string; isUrgent: boolean } {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  const start = new Date(startISO).getTime()
  const sec = Math.max(0, Math.floor((now - start) / 1000))

  let text: string
  if (sec < 60) text = 'hozir'
  else if (sec < 3600) text = `${Math.floor(sec / 60)} daq`
  else text = `${Math.floor(sec / 3600)} soat ${Math.floor((sec % 3600) / 60)} daq`

  return { text, isUrgent: sec >= 300 }  // 5 daqiqadan ko'p — diqqat
}
