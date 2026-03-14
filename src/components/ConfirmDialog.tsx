import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative card p-6 w-full max-w-sm mx-4 shadow-card-md animate-slide-in">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'
          }`}>
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
