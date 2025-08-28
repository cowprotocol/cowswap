import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import type { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import type { TokenInfo } from '@uniswap/token-lists'

import useSWR, { SWRResponse } from 'swr'

export function useBridgeProviderBuyTokens(
  provider: CrossChainOrder['provider'] | undefined,
  buyChainId: number,
): SWRResponse<Record<string, TokenInfo> | undefined> {
  return useSWR(
    [provider, buyChainId, provider?.info.dappId, 'useBridgeProviderBuyTokens'],
    async ([provider, buyChainId]) => {
      if (!provider) return undefined

      const { tokens } = await provider.getBuyTokens({ buyChainId })

      return tokens?.reduce<Record<string, TokenInfo>>((acc, val) => {
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
