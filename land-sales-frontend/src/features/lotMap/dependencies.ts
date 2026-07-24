import { GetLotificationMapUseCase } from './application/useCases/GetLotificationMapUseCase'
import { GetLotificationsUseCase } from './application/useCases/GetLotificationsUseCase'
import { LotMapRepositoryImpl } from './infrastructure/LotMapRepositoryImpl'

const lotMapRepository = new LotMapRepositoryImpl()

export const lotMapDependencies = {
  getLotificationsUseCase: new GetLotificationsUseCase(lotMapRepository),
  getLotificationMapUseCase: new GetLotificationMapUseCase(lotMapRepository),
}
