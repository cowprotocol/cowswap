import { atom } from 'jotai'
import { Token } from '@uniswap/sdk-core'

export const tokensByAddressAtom = atom<{ [address: string]: Token }>({})
export const tokensBySymbolAtom = atom<{ [symbol: string]: Token[] }>({})
