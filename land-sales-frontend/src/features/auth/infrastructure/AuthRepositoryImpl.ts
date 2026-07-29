import { httpClient } from '../../../shared/api/httpClient'
import type { AuthSession, User } from '../domain/entities/User'
import type { AuthRepository, LoginCredentials } from '../domain/repositories/AuthRepository'
import { AuthMapper, type LoginResponseDto } from './mappers/AuthMapper'

const authRequestTimeoutMs = 120_000

export class AuthRepositoryImpl implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await httpClient.post<LoginResponseDto>(
      '/auth/login',
      credentials,
      { skipAuth: true, timeoutMs: authRequestTimeoutMs },
    )
    return AuthMapper.toSession(response)
  }

  async loginDemo(): Promise<AuthSession> {
    const response = await httpClient.post<LoginResponseDto>(
      '/auth/demo',
      undefined,
      { skipAuth: true, timeoutMs: authRequestTimeoutMs },
    )
    return AuthMapper.toSession(response)
  }

  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/auth/me')
    return AuthMapper.toUser(response)
  }
}
