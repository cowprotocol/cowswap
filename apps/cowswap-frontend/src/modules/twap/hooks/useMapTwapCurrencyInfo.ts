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

      const { amountBeforeFees, amountAfterFees, networkFeeAmount, partnerFeeAmount } = receiveAmountInfo

      return {
        ...info,
        receiveAmountInfo: {
          type: receiveAmountInfo.type,
          amountBeforeFees: multiplyAmount(amountBeforeFees, numOfParts),
          amountAfterFees: amountAfterFees.multiply(numOfParts),
          networkFeeAmount: multiplyAmount(networkFeeAmount, numOfParts),
          partnerFeeAmount: multiplyAmount(partnerFeeAmount, numOfParts),
        },
      }
    },
    [numOfParts]
  )
}

function multiplyAmount(
  amount: CurrencyAmount<Currency> | undefined,
  numOfParts: number
): CurrencyAmount<Currency> | undefined {
  return amount ? amount.multiply(numOfParts) : undefined
}
