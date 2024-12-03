import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface SimulationInput {
  input: string
  from: string
  to: string
  value?: string
  gas?: number
  gas_price?: string
}

// { [address: string]: { [token: string]: balanceDiff: string } }
// example: { '0x123': { '0x456': '100', '0xabc': '-100' } }
export type BalancesDiff = Record<string, Record<string, string>>

export interface SimulationData {
  link: string
  status: boolean
  id: string
  cumulativeBalancesDiff: BalancesDiff
  gasUsed: string
}

export interface GetTopTokenHoldersParams {
  tokenAddress?: string
  chainId: SupportedChainId
}

export interface TokenHolder {
  address: string
  balance: string
}
