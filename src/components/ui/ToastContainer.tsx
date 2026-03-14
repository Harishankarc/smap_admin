import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useUIStore, type ToastVariant } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const ICONS: Record<ToastVariant, React.FC<{ size?: number }>> = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
}

const STYLES: Record<ToastVariant, string> = {
  success: 'text-green-700 bg-green-50 border-green-200',
  error:   'text-red-700 bg-red-50 border-red-200',
  warning: 'text-amber-700 bg-amber-50 border-amber-200',
  info:    'text-brand-700 bg-brand-50 border-brand-200',
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant]
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-card-md',
              'min-w-72 max-w-sm animate-slide-in',
              STYLES[t.variant],
            )}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && (
                <p className="text-xs opacity-80 mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
