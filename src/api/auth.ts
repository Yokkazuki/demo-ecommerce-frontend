import api from './axios'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  username: string
  role: string
}

export const authApi = {
  login(data: LoginRequest) {
    return api.post<AuthResponse>('/auth/login', data)
  },
  register(data: RegisterRequest) {
    return api.post<AuthResponse>('/auth/register', data)
  }
}