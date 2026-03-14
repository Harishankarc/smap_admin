import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MonitorPlay, CalendarCheck, Users,
  BarChart3, UserX, Bell, Settings, LogOut, ShieldCheck,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

const NAV = [
  { label: 'Dashboard',      icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  { label: 'Live Monitor',   icon: MonitorPlay,     to: ROUTES.LIVE_MONITOR },
  { divider: 'My Department' },
  { label: 'Attendance',     icon: CalendarCheck,   to: ROUTES.ATTENDANCE },
  { label: 'My Users',       icon: Users,           to: ROUTES.USERS },
  { divider: 'Insights' },
  { label: 'Analytics',      icon: BarChart3,       to: ROUTES.ANALYTICS },
  { divider: 'Security' },
  { label: 'Unknown Faces',  icon: UserX,           to: ROUTES.UNKNOWN_FACES },
  { divider: '' },
  { label: 'Notifications',  icon: Bell,            to: ROUTES.NOTIFICATIONS },
  { label: 'Settings',       icon: Settings,        to: ROUTES.SETTINGS },
] as const

type NavItem = { label: string; icon: React.FC<{ size?: number; className?: string }>; to: string }
type NavDivider = { divider: string }

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full transition-all duration-300 ease-in-out',
        'bg-brand-800 shadow-sidebar select-none',
        sidebarCollapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0',
        sidebarCollapsed && 'justify-center px-0',
      )}>
        <div className="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center shrink-0">
          <ShieldCheck size={16} className="text-brand-900" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-none">SMAP</p>
            <p className="text-white/50 text-2xs mt-0.5 font-medium tracking-wide uppercase">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item, i) => {
          if ('divider' in item) {
            return (
              <div key={i} className={cn('pt-3 pb-1', sidebarCollapsed && 'hidden')}>
                {item.divider && (
                  <p className="px-2 text-2xs font-semibold tracking-widest uppercase text-white/30">
                    {item.divider}
                  </p>
                )}
              </div>
            )
          }

          const { label, icon: Icon, to } = item as NavItem
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn('nav-item', isActive && 'nav-item-active')
              }
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={17} className="shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className={cn(
        'border-t border-white/10 p-3 shrink-0 space-y-1',
      )}>
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded bg-white/5 mb-2">
            <div className="w-7 h-7 rounded-full bg-brand-400 flex items-center justify-center text-brand-900 text-xs font-bold shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">{user.fullName}</p>
              <p className="text-white/40 text-2xs truncate">{user.departmentName}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'nav-item w-full text-white/50 hover:text-red-300 hover:bg-red-500/10',
            sidebarCollapsed && 'justify-center',
          )}
          title={sidebarCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-brand-600 border-2 border-bg
                   flex items-center justify-center text-white shadow-md
                   hover:bg-brand-400 transition-colors z-10"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed
          ? <ChevronRight size={11} />
          : <ChevronLeft size={11} />
        }
      </button>
    </aside>
  )
}
