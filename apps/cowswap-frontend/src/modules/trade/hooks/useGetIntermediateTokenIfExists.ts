import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'

export function useGetIntermediateTokenIfExists(
  orderParams?: { kind: OrderKind; buyToken: string },
): TokenWithLogo | undefined {
  const tokensByAddress = useTokensByAddressMap()

  return useMemo(() => {
    if (!orderParams) return undefined
    // bridge order is always a sell order
    if (orderParams.kind === OrderKind.BUY) return undefined
    const intermediateTokenAddress = orderParams.buyToken

    return tokensByAddress[intermediateTokenAddress.toLowerCase()]
  }, [tokensByAddress, orderParams])
}
