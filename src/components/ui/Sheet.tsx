import { useEffect, type ReactNode } from 'react'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  height?: 'auto' | 'half' | 'full'
}

export function Sheet({ isOpen, onClose, title, children, height = 'auto' }: SheetProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const heightClass = height === 'full' ? 'h-[92dvh]' : height === 'half' ? 'h-[60dvh]' : 'max-h-[92dvh]'

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-40 transition-opacity duration-200',
          'bg-black/60 backdrop-blur-sm',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
      />
      <div
        className={[
          'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[720px]',
          'rounded-t-3xl z-50 flex flex-col',
          'transition-transform duration-300 ease-out',
          'border-t border-border-subtle',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          heightClass,
        ].join(' ')}
        style={{ background: 'linear-gradient(180deg, #131925 0%, #0F131D 100%)' }}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
            <h3 className="text-base font-bold text-text-primary">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-text-muted text-sm"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain safe-bottom">
          {children}
        </div>
      </div>
    </>
  )
}
