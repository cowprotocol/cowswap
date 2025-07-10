import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import type { CrossChainOrder } from '@cowprotocol/cow-sdk'
import type { TokenInfo } from '@uniswap/token-lists'

import useSWR, { SWRResponse } from 'swr'

export function useBridgeProviderBuyTokens(
  provider: CrossChainOrder['provider'] | undefined,
  chainId: number,
): SWRResponse<Record<string, TokenInfo> | undefined> {
  return useSWR(
    [provider, chainId, provider?.info.dappId],
    async ([provider, chainId]) => {
      if (!provider) return undefined

      const tokens = await provider.getBuyTokens(chainId)

      return tokens.reduce<Record<string, TokenInfo>>((acc, val) => {
        acc[val.address.toLowerCase()] = {
          ...val,
          name: val.name || '',
          symbol: val.symbol || '',
        } as TokenInfo
        return acc
      }, {})
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
