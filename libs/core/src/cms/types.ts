import { components } from '@cowprotocol/cms'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type CmsSolversInfo = components['schemas']['SolverListResponseDataItem'][]

export type SolversInfo = SolverInfo[]

export type SolverInfo = {
  solverId: string
  displayName: string
  chainIds: SupportedChainId[]
  image?: string
}
