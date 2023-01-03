import { atom } from 'jotai'
import { Token } from '@uniswap/sdk-core'

export type TokensListState = { [address: string]: Token }

export const tokensListState = atom<TokensListState>({})
