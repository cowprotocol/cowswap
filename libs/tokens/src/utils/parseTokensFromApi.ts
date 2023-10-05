import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenSearchFromApiResult } from '../services/searchTokensInApi'

export function parseTokensFromApi(apiResult: TokenSearchFromApiResult[], chainId: SupportedChainId): TokenWithLogo[] {
  return apiResult
    .filter((token) => token.chainId === chainId)
    .map(
      (token) =>
        new TokenWithLogo(token.project.logoUrl, token.chainId, token.address, token.decimals, token.symbol, token.name)
    )
}
