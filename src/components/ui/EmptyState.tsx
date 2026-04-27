import type { ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-3">
      {icon && (
        <div className="text-6xl text-text-muted opacity-40">{icon}</div>
      )}
      <p className="font-bold text-text-primary text-base">{title}</p>
      {description && (
        <p className="text-sm text-text-muted max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-3">
          {action.label}
        </Button>
      )}
    </div>
  )
}
