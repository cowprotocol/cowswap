import { TokenInfo } from '@cowprotocol/types'
import { Token } from '@uniswap/sdk-core'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const doesTokenMatchSymbolOrAddress = (token: Token | TokenInfo, symbolOrAddress?: string) =>
  token.address.toLowerCase() === symbolOrAddress?.toLowerCase() ||
  token.symbol?.toLowerCase() === symbolOrAddress?.toLowerCase()
