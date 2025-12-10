import { useCallback } from 'react'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { useTwapOrder } from './useTwapOrder'

import { calculateTwapReceivedAmountInfo } from '../utils/calculateTwapReceivedAmountInfo'

export function useMapTwapCurrencyInfo(): (info: CurrencyInfo) => CurrencyInfo {
  const twapOrder = useTwapOrder()
  const numOfParts = twapOrder?.numOfParts

  return useCallback(
    (info: CurrencyInfo) => {
      return {
        ...info,
        receiveAmountInfo: calculateTwapReceivedAmountInfo(info.receiveAmountInfo, numOfParts),
      }
    },
    [numOfParts],
  )
}
