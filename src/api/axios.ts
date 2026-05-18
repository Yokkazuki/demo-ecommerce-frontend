import axios from 'axios'
import { ElMessage } from 'element-plus'
import i18n from '@/locales'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    if (response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if ((response?.status === 502 || response?.status === 503) && !config._retry) {
      config._retry = true
      const { t } = i18n.global
      ElMessage.warning(t('common.serverWaking'))

      await new Promise((resolve) => setTimeout(resolve, 5000))
      return api(config)
    }

    return Promise.reject(error)
  },
)

export default api
