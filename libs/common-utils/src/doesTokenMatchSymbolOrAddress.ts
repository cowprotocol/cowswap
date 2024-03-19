import { Token } from '@uniswap/sdk-core'
import { TokenInfo } from '@cowprotocol/types'

export const doesTokenMatchSymbolOrAddress = (token: Token | TokenInfo, symbolOrAddress: string) =>
  token.address.toLowerCase() === symbolOrAddress.toLowerCase() ||
  token.symbol?.toLowerCase() === symbolOrAddress.toLowerCase()
