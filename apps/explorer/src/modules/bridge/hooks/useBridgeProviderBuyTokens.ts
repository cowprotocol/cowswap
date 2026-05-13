import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { ALL_CHAINS_MAP, getAddressKey, isAdditionalTargetChain } from '@cowprotocol/cow-sdk'
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

      // For non-EVM chains, native tokens may come back without an address.
      // Fall back to the chain's native currency so they are keyed correctly.
      const nativeCurrency = isAdditionalTargetChain(buyChainId) ? ALL_CHAINS_MAP[buyChainId].nativeCurrency : undefined

      return tokens?.reduce<Record<string, TokenInfo>>((acc, val) => {
        const address = val.address || nativeCurrency?.address
        if (!address) return acc

        acc[getAddressKey(address)] = {
          ...val,
          address,
          name: val.name || '',
          symbol: val.symbol || '',
          // SDK uses logoUrl; map it to logoURI so TokenDisplay can find it
          logoURI: val.logoUrl || nativeCurrency?.logoUrl,
        } as TokenInfo
        return acc
      }, {})
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
