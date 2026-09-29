import { MessageDescriptor } from '@lingui/core'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'
import { LpTokenProvider, PersistentStateByChain, TokenInfo } from '@cowprotocol/types'
import { StatusColorVariant } from '@cowprotocol/ui'

import { TokensBySymbol } from './state/tokens/allTokensAtom'

import type { TokenList as UniTokenList } from '@uniswap/token-lists'

export enum TokenListCategory {
  ERC20 = 'ERC20',
  LP = 'LP',
  COW_AMM_LP = 'COW_AMM_LP',
}

export const LP_TOKEN_LIST_CATEGORIES = [TokenListCategory.LP, TokenListCategory.COW_AMM_LP]
export const LP_TOKEN_LIST_COW_AMM_ONLY = [TokenListCategory.COW_AMM_LP]

export type ActiveTokensState = { tokens: TokenWithLogo[]; chainId: SupportedChainId }

export type AdditionalChainTokenListsByChainState = Partial<
  Record<TargetChainId, { [source: string]: ListState | 'deleted' }>
>
export type ListsEnabledState = { [listId: string]: boolean | undefined }

export type ListSourceConfig = {
  widgetAppCode?: string
  priority?: number
  enabledByDefault?: boolean
  lpTokenProvider?: LpTokenProvider
  source: string
}

export type ListsSourcesByNetwork = PersistentStateByChain<Array<ListSourceConfig>>

export interface ListState extends Pick<ListSourceConfig, 'source' | 'priority' | 'widgetAppCode' | 'lpTokenProvider'> {
  list: UniTokenList
  isEnabled?: boolean
}

export type TagInfo = {
  id: string
  name: string | MessageDescriptor
  description: string | MessageDescriptor
  icon?: string
  color?: StatusColorVariant
}

export type TokenListsByChainState = PersistentStateByChain<{ [source: string]: ListState | 'deleted' }>

export type TokenListsState = { [source: string]: ListState }

export type TokenListTags = Record<string, TagInfo>

export type TokensBySymbolState = { tokens: TokensBySymbol; chainId: SupportedChainId }

export type TokensMap = { [address: string]: TokenInfo }

export type UnsupportedTokensState = { [tokenAddress: string]: { dateAdded: number } }
