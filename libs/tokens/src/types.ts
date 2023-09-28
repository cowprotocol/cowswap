import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface TokenListWithUrl {
  id: string // nanoid
  enabledByDefault?: boolean
  updateAt?: number
  url: string
}

export interface TokenListWithEnsName {
  id: string // nanoid
  enabledByDefault?: boolean
  updateAt?: number
  ensName: string
}

export type TokenList = TokenListWithUrl | TokenListWithEnsName

export type TokenListsByNetwork = Record<SupportedChainId, ReadonlyArray<TokenList>>
