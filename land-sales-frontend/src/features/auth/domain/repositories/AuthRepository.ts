import type { AuthSession, User } from '../entities/User'

export type LoginCredentials = {
  username: string
  password: string
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>
  loginDemo(): Promise<AuthSession>
  getCurrentUser(): Promise<User>
}
