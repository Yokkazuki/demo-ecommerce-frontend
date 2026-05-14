import api from './axios'

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  orderId: number
  username: string
  status: string
  totalAmount: number
  items: OrderItem[]
  createdAt: string
}

export interface CouponInfo {
  code: string
  discount: number
}

export interface CouponData {
  id: number
  code: string
  discountType: string
  discountValue: number
  minPurchase: number | null
  maxDiscount: number | null
  quantity: number
  usedCount: number
  isActive: boolean
  expireAt: string | null
}

export interface CouponForm {
  code: string
  discountType: string
  discountValue: number
  minPurchase: number | null
  maxDiscount: number | null
  quantity: number
  isActive: boolean
  expireAt: string | null
}

export interface PageResponse<T> {
  content: T[]
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

export const orderApi = {
  create(couponCode?: string) {
    const params = couponCode ? { couponCode } : {}
    return api.post<Order>('/orders', null, { params })
  },
  getMyOrders() {
    return api.get<Order[]>('/orders')
  },
  getById(orderId: number) {
    return api.get<Order>(`/orders/${orderId}`)
  },
  cancel(orderId: number) {
    return api.put<Order>(`/orders/${orderId}/cancel`)
  },
  // 後台
  getAllOrders(keyword: string = '', status: string = '', page: number = 0, size: number = 10) {
    return api.get<PageResponse<Order>>('/orders/all', { params: { keyword, status, page, size } })
  },
  updateStatus(orderId: number, status: string) {
    return api.put<Order>(`/orders/${orderId}/status`, null, { params: { status } })
  },
}

export const couponApi = {
  validate(code: string, amount: number) {
    return api.get<CouponInfo>('/coupons/validate', { params: { code, amount } })
  },
  getAll() {
    return api.get<CouponData[]>('/coupons')
  },
  create(data: CouponForm) {
    return api.post<CouponData>('/coupons', data)
  },
  update(id: number, data: CouponForm) {
    return api.put<CouponData>(`/coupons/${id}`, data)
  },
  delete(id: number) {
    return api.delete(`/coupons/${id}`)
  },
}
