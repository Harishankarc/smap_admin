import { cn } from '@/lib/utils'
import type { AttendanceStatus } from '@/types'

const CONFIG: Record<AttendanceStatus, { label: string; classes: string }> = {
  present:    { label: 'Present',    classes: 'bg-green-50 text-green-700 ring-green-200' },
  absent:     { label: 'Absent',     classes: 'bg-red-50 text-red-700 ring-red-200' },
  late:       { label: 'Late',       classes: 'bg-amber-50 text-amber-700 ring-amber-200' },
  early_exit: { label: 'Early Exit', classes: 'bg-orange-50 text-orange-700 ring-orange-200' },
  on_leave:   { label: 'On Leave',   classes: 'bg-sky-50 text-sky-700 ring-sky-200' },
}

interface Props {
  status: AttendanceStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const { label, classes } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full ring-1',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-0.5 text-xs',
        classes,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}
