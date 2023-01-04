import { atom } from 'jotai'
import { Token } from '@uniswap/sdk-core'
import { TokenDto } from '@cow/modules/tokensList/types'

export type TokensListState = { [address: string]: Token }
export type TokensListBySymbolState = { [symbol: string]: TokenDto[] }

export const tokensListState = atom<TokensListState>({})
export const tokensListBySymbolState = atom<TokensListBySymbolState>({})
