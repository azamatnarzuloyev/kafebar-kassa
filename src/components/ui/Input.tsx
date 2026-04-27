import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  leading?: ReactNode
  suffix?: ReactNode
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leading, suffix, label, error, className = '', ...rest }, ref) => (
    <label className="block">
      {label && (
        <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
          {label}
        </span>
      )}
      <div className={[
        'flex items-center gap-2 input-dark rounded-xl px-3 h-12',
        error ? '!border-status-cancel ring-2 ring-status-cancel/20' : '',
      ].join(' ')}>
        {leading && <span className="text-text-muted shrink-0">{leading}</span>}
        <input
          ref={ref}
          className={['flex-1 bg-transparent border-0 outline-none text-[15px] placeholder:text-text-dim', className].join(' ')}
          {...rest}
        />
        {suffix && <span className="text-text-muted shrink-0">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-status-cancel mt-1.5">{error}</p>}
    </label>
  )
)
Input.displayName = 'Input'
