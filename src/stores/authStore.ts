import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUserModel } from '@/types'

interface AuthState {
  user: AdminUserModel | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  role: string | null
  setAuth: (user: AdminUserModel, accessToken: string, refreshToken: string, role: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  updateUser: (user: Partial<AdminUserModel>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'smap-admin-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
