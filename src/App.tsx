import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import LiveMonitorPage from '@/pages/live-monitor/LiveMonitorPage'
import AttendancePage from '@/pages/attendance/AttendancePage'
import UsersPage from '@/pages/users/UsersPage'
import UserDetailPage from '@/pages/users/UserDetailPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import UnknownFacesPage from '@/pages/unknown-faces/UnknownFacesPage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-text-secondary">
      <span className="text-5xl font-semibold text-border">404</span>
      <p className="text-sm">Page not found</p>
      <a href={ROUTES.DASHBOARD} className="btn-secondary text-xs">
        Go to Dashboard
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD}       element={<DashboardPage />} />
            <Route path={ROUTES.LIVE_MONITOR}    element={<LiveMonitorPage />} />
            <Route path={ROUTES.ATTENDANCE}      element={<AttendancePage />} />
            <Route path={ROUTES.USERS}           element={<UsersPage />} />
            <Route path={ROUTES.USER_DETAIL}     element={<UserDetailPage />} />
            <Route path={ROUTES.ANALYTICS}       element={<AnalyticsPage />} />
            <Route path={ROUTES.UNKNOWN_FACES}   element={<UnknownFacesPage />} />
            <Route path={ROUTES.NOTIFICATIONS}   element={<NotificationsPage />} />
            <Route path={ROUTES.SETTINGS}        element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
