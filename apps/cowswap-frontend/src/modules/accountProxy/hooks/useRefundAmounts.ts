import { useMemo } from 'react'

import { getTokenId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { toHex } from 'viem'

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

      const tokenKey = getTokenId(token)

      acc[tokenKey] = {
        token,
        balance,
        usdAmount: usdPrice?.price
          ? usdPrice.price.quote(CurrencyAmount.fromRawAmount(token, toHex(balance)))
          : undefined,
        isLoading: !!usdPrice?.isLoading,
      }

      return acc
    }, {})
  }, [usdPrices, tokensToRefund])
}
