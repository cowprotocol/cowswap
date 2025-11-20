import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenId } from '@cowprotocol/common-utils'

type TokenIdentifier = Pick<TokenWithLogo, 'address' | 'chainId'>

export function getTokenUniqueKey(token: TokenIdentifier): string {
  return getTokenId(token)
}
