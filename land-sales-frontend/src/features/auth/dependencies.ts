import { AuthRepositoryImpl } from './infrastructure/AuthRepositoryImpl'
import { GetCurrentUserUseCase } from './application/useCases/GetCurrentUserUseCase'
import { LoginUseCase } from './application/useCases/LoginUseCase'
import { LogoutUseCase } from './application/useCases/LogoutUseCase'

const authRepository = new AuthRepositoryImpl()

export const authDependencies = {
  loginUseCase: new LoginUseCase(authRepository),
  getCurrentUserUseCase: new GetCurrentUserUseCase(authRepository),
  logoutUseCase: new LogoutUseCase(),
}
