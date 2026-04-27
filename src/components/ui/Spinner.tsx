interface Props {
  size?: number
  className?: string
}

export function Spinner({ size = 24, className = '' }: Props) {
  return (
    <span
      className={['inline-block rounded-full border-2 border-white/15 border-t-brand-400 animate-spin', className].join(' ')}
      style={{ width: size, height: size }}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-dvh">
      <Spinner size={32} />
    </div>
  )
}
