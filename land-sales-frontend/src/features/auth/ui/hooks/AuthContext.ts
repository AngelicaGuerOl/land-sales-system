import { createContext } from 'react'
import type { User } from '../../domain/entities/User'
import type { LoginFormValues } from '../schemas/loginSchema'

export type AuthContextValue = {
  user: User | null
  isLoadingUser: boolean
  login(credentials: LoginFormValues): Promise<void>
  logout(): void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
