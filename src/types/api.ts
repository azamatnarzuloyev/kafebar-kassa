export type OrderStatus = 'pending' | 'accepted' | 'ready' | 'served' | 'paid' | 'cancelled'

export interface OrderItemModifier {
  id: string
  option_name: string
  price_delta: number
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  item_total: number
  modifiers: OrderItemModifier[]
}

export interface Order {
  id: string
  branch_id: string
  table_id: string
  table_number?: string
  zone?: string
  customer_id: string | null
  customer_phone?: string | null
  status: OrderStatus
  payment_status: string
  payment_method?: string | null
  subtotal: number
  discount_amount: number
  cashback_used: number
  total: number
  note: string | null
  created_at: string
  updated_at?: string
  items: OrderItem[]
}

export interface Staff {
  id: string
  email: string
  full_name: string
  role: 'superadmin' | 'branch_admin' | 'operator' | 'waiter' | 'warehouse'
  branch_id: string | null
  is_active: boolean
}

export interface Branch {
  id: string
  name: string
  address: string | null
  phone: string | null
  currency: string
  is_active: boolean
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: Staff
}
