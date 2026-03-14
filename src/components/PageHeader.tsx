import { type ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="page-title">{title}</h2>
        {subtitle && <p className="page-subtitle mt-0.5">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
