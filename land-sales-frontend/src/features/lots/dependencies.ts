import { ChangeLotStatusUseCase } from './application/useCases/ChangeLotStatusUseCase'
import { CreateLotUseCase } from './application/useCases/CreateLotUseCase'
import { GetBlocksUseCase } from './application/useCases/GetBlocksUseCase'
import { GetLotUseCase } from './application/useCases/GetLotUseCase'
import { GetLotPriceHistoryUseCase } from './application/useCases/GetLotPriceHistoryUseCase'
import { GetLotsUseCase } from './application/useCases/GetLotsUseCase'
import { GetLotificationsUseCase } from './application/useCases/GetLotificationsUseCase'
import { LotRepositoryImpl } from './infrastructure/LotRepositoryImpl'
import { UpdateLotUseCase } from './application/useCases/UpdateLotUseCase'

const lotRepository = new LotRepositoryImpl()

export const lotDependencies = {
  getLotificationsUseCase: new GetLotificationsUseCase(lotRepository),
  getBlocksUseCase: new GetBlocksUseCase(lotRepository),
  getLotsUseCase: new GetLotsUseCase(lotRepository),
  getLotUseCase: new GetLotUseCase(lotRepository),
  createLotUseCase: new CreateLotUseCase(lotRepository),
  updateLotUseCase: new UpdateLotUseCase(lotRepository),
  changeLotStatusUseCase: new ChangeLotStatusUseCase(lotRepository),
  getLotPriceHistoryUseCase: new GetLotPriceHistoryUseCase(lotRepository),
}
