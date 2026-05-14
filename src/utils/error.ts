import type { ApiError } from '@/types/api'

export function isCancelError(err: unknown): boolean {
  return err === 'cancel'
}

export function getErrorMessage(err: unknown, fallback: string): string {
  const apiError = err as ApiError
  return apiError.response?.data?.message || fallback
}

export function getFullErrorMessage(err: unknown, fallback: string): string {
  const apiError = err as ApiError
  const backendMsg = apiError.response?.data?.message
  return backendMsg ? `${fallback}: ${backendMsg}` : fallback
}
