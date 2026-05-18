import api from './axios'

const HEALTH_CHECK_KEY = 'last_health_check'
const HEALTH_TTL = 14 * 60 * 1000 // 14 分鐘
const RETRY_INTERVAL = 15 * 1000 // 15 秒
const MAX_RETRIES = 5

export async function checkServer(): Promise<boolean> {
  const lastCheck = localStorage.getItem(HEALTH_CHECK_KEY)

  // 14 分鐘內檢查過，直接通過
  if (lastCheck) {
    const elapsed = Date.now() - parseInt(lastCheck)
    if (elapsed < HEALTH_TTL) {
      return true
    }
  }

  // 需要檢查，重試 MAX_RETRIES 次
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await api.get('/health', { timeout: 10000 })
      localStorage.setItem(HEALTH_CHECK_KEY, Date.now().toString())
      return true
    } catch {
      if (i < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL))
      }
    }
  }

  return false
}

export function updateHealthCheck() {
  localStorage.setItem(HEALTH_CHECK_KEY, Date.now().toString())
}
