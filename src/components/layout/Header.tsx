import { useNavigate } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

export function Header() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
      {/* Left: portal title */}
      <div>
        <h1 className="text-sm font-semibold text-text-primary">
          {user?.departmentName
            ? `${user.departmentName} Admin Portal`
            : 'Admin Portal'}
        </h1>
        <p className="text-2xs text-text-secondary">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          })}
        </p>
      </div>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-3">
        {/* Dept-scoped search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Search department…"
            className="input-base pl-8 w-52 h-8 text-xs"
          />
        </div>

        {/* Notification bell */}
        <button
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          className="relative btn-ghost p-2"
          aria-label="Notifications"
        >
          <Bell size={17} />
          {/* Unread badge — wired up when notifications data is available */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-400 ring-2 ring-surface" />
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate(ROUTES.SETTINGS)}
          className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center
                     text-brand-800 text-xs font-bold hover:ring-2 hover:ring-brand-400 transition-all"
          title="Settings"
        >
          {user?.fullName.charAt(0) ?? 'A'}
        </button>
      </div>
    </header>
  )
}
