import { api } from './axios'
import type { Order, OrderStatus } from '@/types/api'

export async function getActiveOrders(branchId: string): Promise<Order[]> {
  const res = await api.get(`/admin/orders/active?branch_id=${branchId}`)
  return res.data.data ?? []
}

export async function getBranchOrders(
  branchId: string,
  opts: { status?: string; limit?: number } = {},
): Promise<Order[]> {
  const params = new URLSearchParams({ branch_id: branchId })
  if (opts.status) params.set('status', opts.status)
  if (opts.limit) params.set('limit', String(opts.limit))
  const res = await api.get(`/admin/orders?${params}`)
  return res.data.data ?? []
}

export async function getOrder(id: string): Promise<Order> {
  const res = await api.get(`/admin/orders/${id}`)
  return res.data.data
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await api.patch(`/admin/orders/${id}/status`, { status })
  return res.data.data
}

export async function cancelOrder(id: string, reason?: string): Promise<Order> {
  const res = await api.post(`/admin/orders/${id}/cancel`, { reason: reason ?? '' })
  return res.data.data
}

export interface ManualOrderItemInput {
  product_id: string
  quantity: number
  modifiers?: { modifier_option_id: string; option_name: string; price_delta: number }[]
}

export interface ManualOrderInput {
  branch_id: string
  table_id: string
  items: ManualOrderItemInput[]
  note?: string | null
  customer_phone?: string | null
}

export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'payme' | 'click' | 'uzum'

export interface PaymentInput {
  order_id: string
  amount: number
  method: PaymentMethod
  transaction_ref?: string | null
}

export async function recordPayment(input: PaymentInput): Promise<{ id: string; cashback_earned?: number }> {
  const res = await api.post(`/admin/orders/${input.order_id}/payment`, {
    order_id: input.order_id,
    amount: input.amount,
    method: input.method,
    transaction_ref: input.transaction_ref ?? null,
  })
  return res.data.data
}

export async function createManualOrder(input: ManualOrderInput): Promise<Order> {
  const res = await api.post('/admin/orders/manual', {
    branch_id: input.branch_id,
    table_id: input.table_id,
    items: input.items.map(i => ({
      product_id: i.product_id,
      quantity: i.quantity,
      modifiers: i.modifiers ?? [],
    })),
    note: input.note ?? null,
    customer_phone: input.customer_phone ?? null,
  })
  return res.data.data
}
