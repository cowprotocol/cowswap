import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { parameterizeTradeRoute } from 'modules/trade'

import { Routes } from 'common/constants/routes'

export function getShedRouteLink(chainId: SupportedChainId): string {
  return parameterizeTradeRoute(
    {
      chainId: chainId.toString(),
      inputCurrencyId: undefined,
      outputCurrencyId: undefined,
      inputCurrencyAmount: undefined,
      outputCurrencyAmount: undefined,
      orderKind: undefined,
    },
    Routes.COW_SHED,
  )
}
