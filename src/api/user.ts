import api from './axios'

export interface UserData {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
}

export const userApi = {
  getAll() {
    return api.get<UserData[]>('/users')
  },
  updateRole(id: number, role: string) {
    return api.put<UserData>(`/users/${id}/role`, null, { params: { role } })
  }
}