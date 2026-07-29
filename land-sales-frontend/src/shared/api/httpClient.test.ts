import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '../../test/server'
import { tokenStorage } from '../lib/storage/tokenStorage'
import { ApiError } from './apiError'
import { httpClient, setUnauthorizedHandler } from './httpClient'

afterEach(() => {
  vi.useRealTimers()
  setUnauthorizedHandler(null)
  tokenStorage.clear()
})

describe('httpClient', () => {
  it('adds the bearer authorization header to authenticated requests', async () => {
    tokenStorage.setToken('Bearer', 'test-token')

    server.use(
      http.get('/api/protected-resource', ({ request }) => {
        return HttpResponse.json({
          authorization: request.headers.get('Authorization'),
        })
      }),
    )

    const response = await httpClient.get<{ authorization: string }>('/protected-resource')

    expect(response.authorization).toBe('Bearer test-token')
  })

  it('does not add authorization when skipAuth is enabled', async () => {
    tokenStorage.setToken('Bearer', 'test-token')

    server.use(
      http.post('/api/auth/login', async ({ request }) => {
        return HttpResponse.json({
          authorization: request.headers.get('Authorization'),
          body: await request.json(),
        })
      }),
    )

    const response = await httpClient.post<{ authorization: string | null; body: unknown }>(
      '/auth/login',
      { username: 'admin', password: 'secret' },
      { skipAuth: true },
    )

    expect(response.authorization).toBeNull()
    expect(response.body).toEqual({ username: 'admin', password: 'secret' })
  })

  it('throws the project ApiError with the API error payload', async () => {
    server.use(
      http.get('/api/failing-resource', () => {
        return HttpResponse.json(
          {
            message: 'Revisa los datos capturados.',
            validationErrors: {
              username: 'El usuario es obligatorio.',
            },
          },
          { status: 400 },
        )
      }),
    )

    await expect(httpClient.get('/failing-resource')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Revisa los datos capturados.',
      details: {
        message: 'Revisa los datos capturados.',
        validationErrors: {
          username: 'El usuario es obligatorio.',
        },
      },
    } satisfies Partial<ApiError>)
  })

  it('calls the unauthorized handler when the API responds with 401', async () => {
    const unauthorizedHandler = vi.fn()
    setUnauthorizedHandler(unauthorizedHandler)

    server.use(
      http.get('/api/current-user', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }),
    )

    await expect(httpClient.get('/current-user')).rejects.toMatchObject({
      status: 401,
      message: 'Unauthorized',
    })

    expect(unauthorizedHandler).toHaveBeenCalledTimes(1)
  })

  it('does not call the unauthorized handler for skipAuth 401 responses', async () => {
    const unauthorizedHandler = vi.fn()
    setUnauthorizedHandler(unauthorizedHandler)

    server.use(
      http.post('/api/auth/demo', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }),
    )

    await expect(httpClient.post('/auth/demo', undefined, { skipAuth: true })).rejects.toMatchObject({
      status: 401,
      message: 'Unauthorized',
    })

    expect(unauthorizedHandler).not.toHaveBeenCalled()
  })

  it('aborts authentication requests that exceed the configured timeout', async () => {
    vi.useFakeTimers()
    server.use(
      http.post('/api/auth/demo', async () => {
        await delay(2_000)
        return HttpResponse.json({ ok: true })
      }),
    )

    const request = httpClient.post('/auth/demo', undefined, { skipAuth: true, timeoutMs: 1_000 })
    const assertion = expect(request).rejects.toMatchObject({
      status: 0,
      message: 'Request timed out',
    })

    await vi.advanceTimersByTimeAsync(1_000)
    await assertion
  })
})
