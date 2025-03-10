import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/types'

import { PermitCompatibleTokens } from 'modules/permit'

export interface SelectTokenContext {
  balancesState: BalancesState
  selectedToken?: string
  onSelectToken(token: TokenWithLogo): void
  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: PermitCompatibleTokens
}

export interface ChainsToSelectState {
  chains: ChainInfo[] | undefined
  defaultChainId?: number
  isLoading?: boolean
}
