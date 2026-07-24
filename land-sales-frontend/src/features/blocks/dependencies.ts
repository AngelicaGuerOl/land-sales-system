import { CreateBlockUseCase } from './application/useCases/CreateBlockUseCase'
import { DeleteBlockUseCase } from './application/useCases/DeleteBlockUseCase'
import { GenerateLotsUseCase } from './application/useCases/GenerateLotsUseCase'
import { UpdateBlockUseCase } from './application/useCases/UpdateBlockUseCase'
import { BlockRepositoryImpl } from './infrastructure/BlockRepositoryImpl'
import { GetBlocksUseCase } from './application/useCases/GetBlocksUseCase'
import { GetLotificationsUseCase } from '../lots/application/useCases/GetLotificationsUseCase'

const blockRepository = new BlockRepositoryImpl()

export const blockDependencies = {
  getBlocksUseCase: new GetBlocksUseCase(blockRepository),
  getLotificationsUseCase: new GetLotificationsUseCase(blockRepository),
  createBlockUseCase: new CreateBlockUseCase(blockRepository),
  updateBlockUseCase: new UpdateBlockUseCase(blockRepository),
  deleteBlockUseCase: new DeleteBlockUseCase(blockRepository),
  generateLotsUseCase: new GenerateLotsUseCase(blockRepository),
}
