import { TokenWithLogo } from '@cowprotocol/common-const'
import { Token } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'

export function tokenWithLogoFromToken(token: Token | TokenInfo, logoUrl?: string): TokenWithLogo {
  return new TokenWithLogo(logoUrl, token.chainId, token.address, token.decimals, token.symbol, token.name)
}
