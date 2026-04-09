import { axiosInstance } from '@/lib/axios'
import axios from 'axios'
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

async function adminLogin(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/api/auth/admin/login', {
    email: payload.email,
    password: payload.password,
  })
  console.log(data)
  return data
}

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: adminLogin,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken, user.role)
      console.log(user)
      navigate(ROUTES.DASHBOARD)
      toast(`Welcome back!!`, 'success')
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ?? 'Login failed'
        : 'Login failed. Please try again.'
      toast(message, 'error')
    },
  })

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return { user, isAuthenticated, loginMutation, logout: handleLogout }
}