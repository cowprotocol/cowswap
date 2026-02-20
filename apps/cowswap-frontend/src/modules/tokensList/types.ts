import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainId, ChainInfo } from '@cowprotocol/cow-sdk'
import type { TokenListTags } from '@cowprotocol/tokens'

import { PermitCompatibleTokens } from 'modules/permit'

export type TokenSelectionHandler = (token: TokenWithLogo) => Promise<void> | void

export interface SelectTokenContext {
  balancesState: BalancesState
  onTokenListItemClick?(token: TokenWithLogo): void
  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: PermitCompatibleTokens
  tokenListTags: TokenListTags
  isWalletConnected: boolean
}

export interface ChainsToSelectState {
  chains: ChainInfo[] | undefined
  defaultChainId?: ChainId
  isLoading?: boolean
  disabledChainIds?: Set<ChainId>
  loadingChainIds?: Set<ChainId>
}
