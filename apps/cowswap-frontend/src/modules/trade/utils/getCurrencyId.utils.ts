import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Token } from '@cowprotocol/currency'

export function getCurrencyId(token: Token | undefined): string {
  if (!token) return ''
  return getIsNativeToken(token.chainId, token.address) ? token.symbol || token.address : token.address
}
