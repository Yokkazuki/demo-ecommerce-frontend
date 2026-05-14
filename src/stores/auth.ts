import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginRequest, type RegisterRequest } from '@/api/auth'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'ADMIN')

  async function login(data: LoginRequest) {
    const res = await authApi.login(data)
    token.value = res.data.token
    username.value = res.data.username
    role.value = res.data.role

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    localStorage.setItem('role', res.data.role)
  }

  async function register(data: RegisterRequest) {
    const res = await authApi.register(data)
    token.value = res.data.token
    username.value = res.data.username
    role.value = res.data.role

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    localStorage.setItem('role', res.data.role)
  }

  function logout() {
    token.value = ''
    username.value = ''
    role.value = ''
    localStorage.clear()
  }

  return { token, username, role, isLoggedIn, isAdmin, login, register, logout }
})