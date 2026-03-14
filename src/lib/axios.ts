import axios from 'axios'
import { API } from '@/constants/api'
import { useAuthStore } from '@/stores/authStore'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 → try refresh → retry once
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return axiosInstance(original)
          })
          .catch(Promise.reject.bind(Promise))
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const { data } = await axios.post(API.REFRESH, { refreshToken })
        const newToken: string = data.accessToken
        useAuthStore.getState().setTokens(newToken, data.refreshToken ?? refreshToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(original)
      } catch (err) {
        processQueue(err, null)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
