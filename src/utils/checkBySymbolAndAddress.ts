import { Token } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'

export const checkBySymbolAndAddress = (token: Token | TokenInfo, symbolOrAddress: string) =>
  token.address.toLowerCase() === symbolOrAddress.toLowerCase() ||
  token.symbol?.toLowerCase() === symbolOrAddress.toLowerCase()
