import { env } from '../../app/config/env'
import { tokenStorage } from '../lib/storage/tokenStorage'
import { ApiError } from './apiError'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = tokenStorage.getToken()

  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `${tokenStorage.getTokenType()} ${token}`)
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.()
    }
    throw new ApiError(response.status, payload?.message ?? response.statusText, payload)
  }

  return payload as T
}

export const httpClient = {
  get<T>(path: string) {
    return request<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body: unknown) {
    return request<T>(path, { method: 'POST', body })
  },
}
