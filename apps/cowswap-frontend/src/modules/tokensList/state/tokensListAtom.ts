import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

export type TokensByAddress = { [address: string]: TokenWithLogo }

export type TokensBySymbol = { [address: string]: TokenWithLogo[] }

export const tokensByAddressAtom = atom<TokensByAddress>({})
export const tokensBySymbolAtom = atom<TokensBySymbol>({})
