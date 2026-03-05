import { Token } from '@cowprotocol/currency'
import { TokenInfo } from '@cowprotocol/types'

export const doesTokenMatchSymbolOrAddress = (token: Token | TokenInfo, symbolOrAddress?: string): boolean =>
  token.address.toLowerCase() === symbolOrAddress?.toLowerCase() ||
  token.symbol?.toLowerCase() === symbolOrAddress?.toLowerCase()
