import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import type { TokenListTags } from '@cowprotocol/tokens'

import { PermitCompatibleTokens } from 'modules/permit'

export interface SelectTokenContext {
  balancesState: BalancesState
  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: PermitCompatibleTokens
  tokenListTags: TokenListTags
  isWalletConnected: boolean
}

export interface ChainsToSelectState {
  chains: ChainInfo[] | undefined
  defaultChainId?: number
  isLoading?: boolean
}
