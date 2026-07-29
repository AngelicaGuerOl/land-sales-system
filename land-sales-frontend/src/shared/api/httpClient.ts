import { env } from '../../app/config/env'
import { tokenStorage } from '../lib/storage/tokenStorage'
import { ApiError } from './apiError'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuth?: boolean
  timeoutMs?: number
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
    || error instanceof Error && error.name === 'AbortError'
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, timeoutMs, ...requestInit } = options
  const headers = new Headers(requestInit.headers)
  const token = tokenStorage.getToken()
  const timeoutController = timeoutMs === undefined ? null : new AbortController()
  const timeoutId = timeoutController === null
    ? undefined
    : window.setTimeout(() => timeoutController.abort(), timeoutMs)

  if (!headers.has('Content-Type') && requestInit.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !skipAuth) {
    const tokenType = tokenStorage.getTokenType().trim() || 'Bearer'
    const normalizedToken = token.replace(/^Bearer\s+/i, '').trim()
    headers.set('Authorization', `${tokenType} ${normalizedToken}`)
  }

  let response: Response

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...requestInit,
      headers,
      signal: requestInit.signal ?? timeoutController?.signal,
      body: requestInit.body === undefined ? undefined : JSON.stringify(requestInit.body),
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError(0, 'Request timed out')
    }
    throw error
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }
  }

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (response.status === 401 && !skipAuth) {
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
  post<T>(path: string, body: unknown, options: Pick<RequestOptions, 'skipAuth' | 'timeoutMs'> = {}) {
    return request<T>(path, { method: 'POST', body, ...options })
  },
  put<T>(path: string, body: unknown) {
    return request<T>(path, { method: 'PUT', body })
  },
  patch<T>(path: string, body: unknown) {
    return request<T>(path, { method: 'PATCH', body })
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  },
}
