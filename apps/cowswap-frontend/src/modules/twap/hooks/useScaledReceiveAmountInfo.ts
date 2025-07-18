import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { ReceiveAmountInfo, useGetReceiveAmountInfo } from 'modules/trade'

import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { calculateTwapReceivedAmountInfo } from '../utils/calculateTwapReceivedAmountInfo'

export function useScaledReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const receiveAmountInfo = useGetReceiveAmountInfo()

  return useMemo(() => {
    return calculateTwapReceivedAmountInfo(receiveAmountInfo, numberOfPartsValue)
  }, [receiveAmountInfo, numberOfPartsValue])
}
