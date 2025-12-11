import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { TokenListCategory, TokenListTags, UnsupportedTokensState } from '@cowprotocol/tokens'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { PermitCompatibleTokens } from 'modules/permit'

import { ChainsToSelectState, TokenSelectionHandler } from '../../types'

export interface TokenListContentProps<T = TokenListCategory[] | null> {
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  recentTokens?: TokenWithLogo[]
  balancesState: BalancesState
  unsupportedTokens: UnsupportedTokensState
  selectedToken?: Nullish<Currency>
  permitCompatibleTokens: PermitCompatibleTokens
  hideFavoriteTokensTooltip?: boolean
  displayLpTokenLists?: boolean
  disableErc20?: boolean
  account: string | undefined
  tokenListCategoryState: [T, (category: T) => void]
  defaultInputValue?: string
  areTokensLoading: boolean
  tokenListTags: TokenListTags
  standalone?: boolean
  areTokensFromBridge: boolean
  isRouteAvailable: boolean | undefined
  modalTitle?: string
  hasChainPanel?: boolean
  chainsPanelTitle?: string
  isFullScreenMobile?: boolean
  selectedTargetChainId?: number
  mobileChainsState?: ChainsToSelectState
  mobileChainsLabel?: string
  onOpenMobileChainPanel?(): void
}

export interface ChainSelectionProps {
  chainsToSelect?: ChainsToSelectState
  onSelectChain(chain: ChainInfo): void
}

export interface ModalCallbackProps {
  onSelectToken: TokenSelectionHandler
  onTokenListItemClick?(token: TokenWithLogo): void
  onClearRecentTokens?(): void
  openPoolPage(poolAddress: string): void
  onInputPressEnter?(): void
  onOpenManageWidget(): void
  onDismiss(): void
}

export type SelectTokenModalProps<T = TokenListCategory[] | null> = TokenListContentProps<T> &
  ChainSelectionProps &
  ModalCallbackProps
