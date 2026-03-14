import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="card p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="font-semibold text-text-primary">Access Denied</h2>
          <p className="text-sm text-text-secondary">
            This portal is for Admins only. Please use the Super Admin portal.
          </p>
          <button className="btn-secondary w-full" onClick={() => useAuthStore.getState().logout()}>
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  if (!user.departmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="card p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-sm text-text-secondary">
            Your account is not assigned to a department. Contact your Super Admin.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
