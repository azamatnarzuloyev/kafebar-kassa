import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  block?: boolean
  icon?: ReactNode
}

const variants = {
  primary: 'btn-primary',
  success: 'btn-success',
  danger:  'btn-danger',
  ghost:   'btn-ghost',
}

const sizes = {
  sm: 'h-9  px-3 text-[13px] rounded-xl gap-1.5',
  md: 'h-11 px-4 text-sm    rounded-xl gap-2',
  lg: 'h-13 px-5 text-base  rounded-2xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, block, icon, children, className = '', disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        block ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? <Spinner size={16} className="border-current" /> : icon}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
