import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { twapOrderAtom } from '../state/twapOrderAtom'
import { calculateTwapReceivedAmountInfo } from '../utils/calculateTwapReceivedAmountInfo'

export function useMapTwapCurrencyInfo(): (info: CurrencyInfo) => CurrencyInfo {
  const twapOrder = useAtomValue(twapOrderAtom)
  const numOfParts = twapOrder?.numOfParts

  return useCallback(
    (info: CurrencyInfo) => {
      return {
        ...info,
        receiveAmountInfo: calculateTwapReceivedAmountInfo(info.receiveAmountInfo, numOfParts),
      }
    },
    [numOfParts]
  )
}
