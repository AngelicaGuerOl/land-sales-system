import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUnauthorizedHandler } from '../../../../shared/api/httpClient'
import { routePaths } from '../../../../shared/routes/routePaths'
import { tokenStorage } from '../../../../shared/lib/storage/tokenStorage'
import { authDependencies } from '../../dependencies'
import type { AuthSession } from '../../domain/entities/User'
import type { LoginFormValues } from '../schemas/loginSchema'
import { AuthContext } from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

const currentUserQueryKey = ['auth', 'me'] as const

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [hasSession, setHasSession] = useState(() => Boolean(tokenStorage.getToken()))

  const clearSession = useCallback(() => {
    authDependencies.logoutUseCase.execute()
    setHasSession(false)
    queryClient.clear()
  }, [queryClient])

  const redirectToLogin = useCallback(() => {
    clearSession()
    navigate(routePaths.login, { replace: true })
  }, [clearSession, navigate])

  const applySession = useCallback((session: AuthSession) => {
    tokenStorage.setToken(session.tokenType, session.accessToken)
    setHasSession(true)
    queryClient.setQueryData(currentUserQueryKey, session.user)
    navigate(routePaths.dashboard, { replace: true })
  }, [navigate, queryClient])

  const currentUserQuery = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => authDependencies.getCurrentUserUseCase.execute(),
    enabled: hasSession,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormValues) => authDependencies.loginUseCase.execute(credentials),
    onSuccess: applySession,
  })

  const loginDemoMutation = useMutation({
    mutationFn: () => authDependencies.loginDemoUseCase.execute(),
    onSuccess: applySession,
  })

  const logout = useCallback(() => {
    clearSession()
    navigate(routePaths.login, { replace: true })
  }, [clearSession, navigate])

  useEffect(() => {
    setUnauthorizedHandler(redirectToLogin)
    return () => setUnauthorizedHandler(null)
  }, [redirectToLogin])

  const user = currentUserQuery.data ?? null
  const isLoadingUser = hasSession && !user && currentUserQuery.isFetching
  const isAuthenticated = hasSession && Boolean(user)
  const login = useCallback(async (credentials: LoginFormValues) => {
    await loginMutation.mutateAsync(credentials)
  }, [loginMutation])
  const loginDemo = useCallback(async () => {
    await loginDemoMutation.mutateAsync()
  }, [loginDemoMutation])
  const contextValue = useMemo(() => ({
    user,
    hasSession,
    isAuthenticated,
    isLoadingUser,
    login,
    loginDemo,
    logout,
  }), [hasSession, isAuthenticated, isLoadingUser, login, loginDemo, logout, user])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
