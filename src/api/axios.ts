import axios, { AxiosError } from 'axios'
import { useSessionStore } from '@/store/sessionStore'

const BASE_URL = import.meta.env.VITE_API_URL as string

export const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(config => {
  const token = useSessionStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401) {
      // Avto-logout
      useSessionStore.getState().clear()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
