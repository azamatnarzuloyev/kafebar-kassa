import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  isOpen: boolean
  onClose: () => void
  onResult: (text: string) => void
}

const ELEMENT_ID = 'kafebar-kassa-qr-reader'

export function QRScanner({ isOpen, onClose, onResult }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    const scanner = new Html5Qrcode(ELEMENT_ID, { verbose: false })
    scannerRef.current = scanner

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 320, height: 320 } },
          (decoded) => {
            if (cancelled) return
            cancelled = true
            scanner.stop().then(() => scanner.clear()).catch(() => {})
            onResult(decoded)
          },
          () => {},
        )
      } catch (e) {
        console.error('Camera start failed', e)
      }
    }
    start()

    return () => {
      cancelled = true
      const s = scannerRef.current
      if (s) {
        s.stop().then(() => s.clear()).catch(() => {})
      }
    }
  }, [isOpen, onResult])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-white font-bold text-lg">Сканирование QR-кода клиента</p>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="w-11 h-11 rounded-full bg-white/10 text-white text-base"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div id={ELEMENT_ID} className="w-full h-full" />
        {/* Frame overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[340px] h-[340px] rounded-3xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
        </div>
      </div>

      <p className="text-center text-white/70 text-sm px-8 py-5">
        Поднесите QR-код с экрана клиента к рамке. После считывания откроется окно оплаты.
      </p>
    </div>
  )
}
