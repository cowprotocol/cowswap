import { atom } from 'jotai'
import { Token } from '@uniswap/sdk-core'

// It's a hack for useCurrencyLogoURIs(), must be refactored
export class TokenWithLogo extends Token {
  constructor(
    public logoURI: string | undefined,
    chainId: number,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
    bypassChecksum?: boolean
  ) {
    super(chainId, address, decimals, symbol, name, bypassChecksum)
  }
}

export const tokensByAddressAtom = atom<{ [address: string]: TokenWithLogo }>({})
export const tokensBySymbolAtom = atom<{ [symbol: string]: TokenWithLogo[] }>({})
