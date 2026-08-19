import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenListTags } from '@cowprotocol/tokens'

import { PermitCompatibleTokens } from 'modules/permit'

export interface ChainsToSelectState {
  chains: ChainInfo[] | undefined
  defaultChainId?: number
  isLoading?: boolean
  disabledChainIds?: Set<number>
  loadingChainIds?: Set<number>
}

export interface SelectTokenContext {
  balancesState: BalancesState
  onTokenListItemClick?(token: TokenWithLogo): void
  onSelectNetwork?(chainId: SupportedChainId, skipClose?: boolean): Promise<void>
  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: PermitCompatibleTokens
  tokenListTags: TokenListTags
  isWalletConnected: boolean
}

export type TokenSelectionHandler = (token: TokenWithLogo) => Promise<void> | void
