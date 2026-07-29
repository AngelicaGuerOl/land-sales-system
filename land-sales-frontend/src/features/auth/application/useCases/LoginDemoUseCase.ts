import type { AuthSession } from '../../domain/entities/User'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'

export class LoginDemoUseCase {
  private readonly authRepository: AuthRepository

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository
  }

  execute(): Promise<AuthSession> {
    return this.authRepository.loginDemo()
  }
}
