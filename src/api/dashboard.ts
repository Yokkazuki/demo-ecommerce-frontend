import api from './axios'

export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalUsers: number
  totalCoupons: number
  totalRevenue: number
  orderStatusCounts: Record<string, number>
}

export const dashboardApi = {
  getStats() {
    return api.get<DashboardStats>('/dashboard')
  },
}
