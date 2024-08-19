import { components } from '@cowprotocol/cms'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type CmsSolversInfo = components['schemas']['SolverListResponseDataItem'][]

export type SolversInfo = SolverInfo[]

export type SolverInfo = {
  solverId: string
  displayName: string
  solverNetworks: SolverNetwork[]
  image?: string
}

export type SolverNetwork = {
  chainId: SupportedChainId
  env: string
  active: boolean
}
