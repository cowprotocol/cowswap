import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { TokenInfo } from '@cowprotocol/types'

export const doesTokenMatchSymbolOrAddress = (token: Token | TokenInfo, symbolOrAddress?: string): boolean =>
  getAddressKey(token.address) === symbolOrAddress?.toLowerCase() ||
  token.symbol?.toLowerCase() === symbolOrAddress?.toLowerCase()
