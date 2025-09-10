import { TokenWithLogo } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'

import { TokenSearchFromApiResult } from '../services/searchTokensInApi'

export function parseTokensFromApi(apiResult: TokenSearchFromApiResult[]): TokenWithLogo[] {
  return apiResult
    .map((token) => {
      try {
        return TokenWithLogo.fromToken(token, token.logoURI)
      } catch (e) {
        console.error('parseTokensFromApi error', e)

        return null
      }
    })
    .filter(isTruthy)
}
