import { api } from './axios'
import type { Branch } from '@/types/api'

export async function getBranches(): Promise<Branch[]> {
  const res = await api.get('/admin/branches')
  return res.data.data ?? []
}

export async function getBranch(id: string): Promise<Branch> {
  const res = await api.get(`/admin/branches/${id}`)
  return res.data.data
}
