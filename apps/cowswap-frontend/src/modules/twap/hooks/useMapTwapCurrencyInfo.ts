import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { twapOrderAtom } from '../state/twapOrderAtom'

export function useMapTwapCurrencyInfo(): (info: CurrencyInfo) => CurrencyInfo {
  const twapOrder = useAtomValue(twapOrderAtom)
  const numOfParts = twapOrder?.numOfParts

  return useCallback(
    (info: CurrencyInfo) => {
      if (!numOfParts) return info

      const { receiveAmountInfo } = info

      if (!receiveAmountInfo) return info

      const { isSell, costs, beforeNetworkCosts, afterNetworkCosts, afterPartnerFees } = receiveAmountInfo

      const scaleAmount = (amount: CurrencyAmount<Currency>) => amount.multiply(numOfParts!)

      return {
        ...info,
        receiveAmountInfo: {
          isSell,
          costs: {
            networkFee: {
              amountInSellCurrency: scaleAmount(costs.networkFee.amountInSellCurrency),
              amountInBuyCurrency: scaleAmount(costs.networkFee.amountInBuyCurrency),
            },
            partnerFee: {
              amount: scaleAmount(costs.partnerFee.amount),
              bps: costs.partnerFee.bps,
            },
          },
          beforeNetworkCosts: {
            sellAmount: scaleAmount(beforeNetworkCosts.sellAmount),
            buyAmount: scaleAmount(beforeNetworkCosts.buyAmount),
          },
          afterNetworkCosts: {
            sellAmount: scaleAmount(afterNetworkCosts.sellAmount),
            buyAmount: scaleAmount(afterNetworkCosts.buyAmount),
          },
          afterPartnerFees: {
            sellAmount: scaleAmount(afterPartnerFees.sellAmount),
            buyAmount: scaleAmount(afterPartnerFees.buyAmount),
          },
        },
      }
    },
    [numOfParts]
  )
}
