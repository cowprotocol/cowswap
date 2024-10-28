import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface SimulationInput {
  input: string
  from: string
  to: string
  value?: string
  gas?: number
  gas_price?: string
}

export interface SimulationData {
  link: string
  status: boolean
  id: string
}

export interface GetTopTokenHoldersParams {
  tokenAddress?: string
  chainId: SupportedChainId
}

export interface TokenHolder {
  address: string
  balance: string
}
