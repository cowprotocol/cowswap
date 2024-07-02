import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'
import type { TokenList as UniTokenList } from '@uniswap/token-lists'

export type ListSourceConfig = {
  widgetAppCode?: string
  priority?: number
  enabledByDefault?: boolean
  source: string
}

export type ListsSourcesByNetwork = Record<SupportedChainId, Array<ListSourceConfig>>

export type TokensMap = { [address: string]: TokenInfo }

export type UnsupportedTokensState = { [tokenAddress: string]: { dateAdded: number } }

export type ListsEnabledState = { [listId: string]: boolean | undefined }

export interface ListState {
  source: string
  list: UniTokenList
  widgetAppCode?: string
  priority?: number
  isEnabled?: boolean
}

export type TokenListsState = { [source: string]: ListState }

export type TokenListsByChainState = Record<SupportedChainId, TokenListsState | undefined>
