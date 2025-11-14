import { TokenWithLogo } from '@cowprotocol/common-const'

type TokenIdentifier = Pick<TokenWithLogo, 'address' | 'chainId'>

export function getTokenUniqueKey(token: TokenIdentifier): string {
  return `${token.chainId}:${token.address.toLowerCase()}`
}
