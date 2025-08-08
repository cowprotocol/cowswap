import { useMemo } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'

import { getUsdPriceStateKey, useUsdPrices } from 'modules/usdAmount'

import { useTokensToRefund } from './useTokensToRefund'

import { TokenUsdAmounts } from '../types'

export function useRefundAmounts(): TokenUsdAmounts | null {
  const tokensToRefund = useTokensToRefund()

  const tokens = useMemo(() => {
    if (!tokensToRefund) return []

    return tokensToRefund.map((t) => t.token)
  }, [tokensToRefund])

  const usdPrices = useUsdPrices(tokens)

  return useMemo(() => {
    if (!usdPrices || !tokensToRefund) return null

    return tokensToRefund.reduce<TokenUsdAmounts>((acc, { token, balance }) => {
      const usdPrice = usdPrices[getUsdPriceStateKey(token)]

      const tokenKey = token.address.toLowerCase()

      acc[tokenKey] = {
        token,
        balance,
        usdAmount: usdPrice?.price
          ? usdPrice.price.quote(CurrencyAmount.fromRawAmount(token, balance.toHexString()))
          : undefined,
        isLoading: !!usdPrice?.isLoading,
      }

      return acc
    }, {})
  }, [usdPrices, tokensToRefund])
}
