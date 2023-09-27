import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface TokenList {
  id: string // nanoid
  url: string
}

export type TokenListsByNetwork = Record<SupportedChainId, ReadonlyArray<TokenList>>
