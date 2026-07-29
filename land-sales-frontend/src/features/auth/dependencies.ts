import { AuthRepositoryImpl } from './infrastructure/AuthRepositoryImpl'
import { GetCurrentUserUseCase } from './application/useCases/GetCurrentUserUseCase'
import { LoginDemoUseCase } from './application/useCases/LoginDemoUseCase'
import { LoginUseCase } from './application/useCases/LoginUseCase'
import { LogoutUseCase } from './application/useCases/LogoutUseCase'

const authRepository = new AuthRepositoryImpl()

export const authDependencies = {
  loginUseCase: new LoginUseCase(authRepository),
  loginDemoUseCase: new LoginDemoUseCase(authRepository),
  getCurrentUserUseCase: new GetCurrentUserUseCase(authRepository),
  logoutUseCase: new LogoutUseCase(),
}
