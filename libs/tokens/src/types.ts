import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo, TokenList as UniTokenList } from '@uniswap/token-lists'

export type ListResource = { ensName: string } | { url: string }

export interface ListSourceConfigWithUrl {
  id: string // nanoid
  priority?: number
  enabledByDefault?: boolean
  url: string
}

export interface ListSourceConfigWithEnsName {
  id: string // nanoid
  priority?: number
  enabledByDefault?: boolean
  ensName: string
}

export type ListSourceConfig = ListSourceConfigWithUrl | ListSourceConfigWithEnsName

export type ListsSourcesByNetwork = Record<SupportedChainId, ReadonlyArray<ListSourceConfig>>

export type TokensMap = { [address: string]: TokenInfo }

export type ListsEnabledState = { [listId: string]: boolean | undefined }

export interface ListState {
  id: string
  source: ListResource
  list: UniTokenList
  priority?: number
  isEnabled?: boolean
}
