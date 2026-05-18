import api from './axios'

export async function checkServer(): Promise<boolean> {
  try {
    await api.get('/health')
    return true
  } catch {
    return false
  }
}
