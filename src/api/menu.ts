import { api } from './axios'

export interface MenuCategory {
  id: string
  name: string
  name_uz?: string | null
  image_url?: string | null
  sort_order?: number
}

export interface MenuProduct {
  id: string
  name: string
  name_uz?: string | null
  description?: string | null
  category_id: string | null
  base_price: number
  price: number
  cover_image?: string | null
  images?: { id: string; url: string; is_cover: boolean }[]
  is_available: boolean
  is_active: boolean
  sort_order?: number
}

export interface MenuPayload {
  branch: { id: string; name: string; currency: string }
  categories: MenuCategory[]
  products: MenuProduct[]
}

export async function getMenu(branchId: string): Promise<MenuPayload> {
  const res = await api.get(`/menu/${branchId}`)
  return res.data.data
}
