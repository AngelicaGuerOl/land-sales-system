import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '../../../../shared/routes/routePaths'
import { tokenStorage } from '../../../../shared/lib/storage/tokenStorage'
import { authDependencies } from '../../dependencies'
import type { LoginFormValues } from '../schemas/loginSchema'
import { AuthContext } from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authDependencies.getCurrentUserUseCase.execute(),
    enabled: Boolean(tokenStorage.getToken()),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormValues) => authDependencies.loginUseCase.execute(credentials),
    onSuccess: (session) => {
      tokenStorage.setToken(session.tokenType, session.accessToken)
      queryClient.setQueryData(['auth', 'me'], session.user)
      navigate(routePaths.lotMap, { replace: true })
    },
  })

  function logout() {
    authDependencies.logoutUseCase.execute()
    queryClient.clear()
    navigate(routePaths.login, { replace: true })
  }

  return (
    <AuthContext.Provider
      value={{
        user: currentUserQuery.data ?? null,
        isLoadingUser: currentUserQuery.isLoading,
        login: async (credentials) => {
          await loginMutation.mutateAsync(credentials)
        },
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
