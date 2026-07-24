import { tokenStorage } from '../../../../shared/lib/storage/tokenStorage'

export class LogoutUseCase {
  execute() {
    tokenStorage.clear()
  }
}
