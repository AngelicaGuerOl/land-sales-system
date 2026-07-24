import type { AuthSession } from '../../domain/entities/User'
import type { AuthRepository, LoginCredentials } from '../../domain/repositories/AuthRepository'

export class LoginUseCase {
  private readonly authRepository: AuthRepository

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository
  }

  execute(credentials: LoginCredentials): Promise<AuthSession> {
    return this.authRepository.login(credentials)
  }
}
