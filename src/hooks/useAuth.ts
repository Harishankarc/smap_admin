import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import { toast } from '@/stores/uiStore'
import type { AdminUserModel } from '@/types'

interface LoginPayload {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AdminUserModel
}

async function mockLogin(payload: LoginPayload): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 800))
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      adminId: 'admin-001',
      fullName: 'Demo Admin',
      email: payload.email,
      departmentId: 'dept-001',
      departmentName: 'Engineering',
      role: 'admin',
      lastLogin: new Date().toISOString(),
    },
  }
}

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: mockLogin,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken)
      navigate(ROUTES.DASHBOARD)
      toast(`Welcome back, ${user.fullName.split(' ')[0]}!`, 'success')
    },
    onError: () => {
      toast('Login failed. Please try again.', 'error')
    },
  })

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return { user, isAuthenticated, loginMutation, logout: handleLogout }
}
