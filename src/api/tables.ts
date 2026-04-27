import { api } from './axios'

export interface Table {
  id: string
  branch_id: string
  number: string
  zone: string | null
  capacity: number | null
  is_active: boolean
}

export async function getTables(branchId: string): Promise<Table[]> {
  const res = await api.get(`/admin/tables?branch_id=${branchId}`)
  return res.data.data ?? []
}
