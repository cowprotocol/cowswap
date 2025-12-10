import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import {
  ListState,
  TokenListCategory,
  TokenListTags,
  UnsupportedTokensState,
  useAllListsList,
} from '@cowprotocol/tokens'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { PermitCompatibleTokens } from 'modules/permit'

import { ChainsToSelectState } from '../../types'

export interface SelectTokenWidgetContentProps {
  standalone?: boolean
  tokenToImport?: TokenWithLogo
  listToImport?: ListState
  isManageWidgetOpen: boolean
  selectedPoolAddress?: string
  displayLpTokenLists?: boolean
  unsupportedTokens: UnsupportedTokensState
  selectedToken?: Nullish<Currency>
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  recentTokens?: TokenWithLogo[]
  balancesState: BalancesState
  permitCompatibleTokens: PermitCompatibleTokens
  onSelectToken: (token: TokenWithLogo) => void
  handleTokenListItemClick: (token: TokenWithLogo) => void
  onInputPressEnter?: () => void
  onDismiss: () => void
  setIsManageWidgetOpen: (open: boolean) => void
  resetTokenImport: () => void
  importTokenAndClose: (tokens: TokenWithLogo[]) => void
  closePoolPage: () => void
  importListAndBack: (list: ListState) => void
  isInjectedWidgetMode: boolean
  openPoolPage: (poolAddress: string) => void
  tokenListCategoryState: [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]
  disableErc20: boolean
  account: string | undefined
  chainsToSelect: ChainsToSelectState | undefined
  onSelectChain: (chain: ChainInfo) => void
  areTokensLoading: boolean
  tokenListTags: TokenListTags
  areTokensFromBridge: boolean
  isRouteAvailable: boolean | undefined
  clearRecentTokens: () => void
  selectedTargetChainId?: number
  allTokenLists: ReturnType<typeof useAllListsList>
  userAddedTokens: TokenWithLogo[]
}

export interface ManageListsAndTokensContentProps {
  allTokenLists: ReturnType<typeof useAllListsList>
  userAddedTokens: TokenWithLogo[]
  onDismiss: () => void
  setIsManageWidgetOpen: (open: boolean) => void
}

export interface LpTokenPageContentProps {
  selectedPoolAddress: string
  onDismiss: () => void
  closePoolPage: () => void
  onSelectToken: (token: TokenWithLogo) => void
}

export interface SelectTokenModalContentProps {
  standalone?: boolean
  displayLpTokenLists?: boolean
  unsupportedTokens: UnsupportedTokensState
  selectedToken?: Nullish<Currency>
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  recentTokens?: TokenWithLogo[]
  balancesState: BalancesState
  permitCompatibleTokens: PermitCompatibleTokens
  onSelectToken: (token: TokenWithLogo) => void
  handleTokenListItemClick: (token: TokenWithLogo) => void
  onInputPressEnter?: () => void
  onDismiss: () => void
  setIsManageWidgetOpen: (open: boolean) => void
  isInjectedWidgetMode: boolean
  openPoolPage: (poolAddress: string) => void
  tokenListCategoryState: [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]
  disableErc20: boolean
  account: string | undefined
  chainsToSelect: ChainsToSelectState | undefined
  onSelectChain: (chain: ChainInfo) => void
  areTokensLoading: boolean
  tokenListTags: TokenListTags
  areTokensFromBridge: boolean
  isRouteAvailable: boolean | undefined
  clearRecentTokens: () => void
  selectedTargetChainId?: number
}
