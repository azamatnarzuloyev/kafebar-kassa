import { api } from './axios'
import type { AuthResponse } from '@/types/api'

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/auth/login', { email, password })
  return res.data.data
}
