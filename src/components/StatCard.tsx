import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: number | string
  icon: LucideIcon
  color?: 'teal' | 'green' | 'red' | 'amber' | 'purple'
  trend?: { value: number; label: string }
  onClick?: () => void
  loading?: boolean
}

const COLOR_MAP = {
  teal:   { icon: 'bg-brand-100 text-brand-600',  border: 'border-brand-200' },
  green:  { icon: 'bg-green-50 text-green-600',   border: 'border-green-200' },
  red:    { icon: 'bg-red-50 text-red-600',        border: 'border-red-200' },
  amber:  { icon: 'bg-amber-50 text-amber-600',    border: 'border-amber-200' },
  purple: { icon: 'bg-purple-50 text-purple-600',  border: 'border-purple-200' },
}

export function StatCard({ title, value, icon: Icon, color = 'teal', trend, onClick, loading }: Props) {
  const { icon: iconCls } = COLOR_MAP[color]

  return (
    <div
      className={cn(
        'card p-5 flex items-start gap-4 transition-shadow',
        onClick && 'cursor-pointer hover:shadow-card-md',
      )}
      onClick={onClick}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', iconCls)}>
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary font-medium">{title}</p>

        {loading ? (
          <div className="mt-1 h-7 w-16 bg-border animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-semibold text-text-primary mt-0.5 leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        )}

        {trend && !loading && (
          <p className={cn(
            'text-2xs mt-1.5 font-medium',
            trend.value >= 0 ? 'text-green-600' : 'text-red-600',
          )}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  )
}
