import { useMemo } from 'react'

import { useGetReceiveAmountInfo } from './useGetReceiveAmountInfo'

import { OrderTypeReceiveAmounts } from '../types'
import { getOrderTypeReceiveAmounts } from '../utils/getCrossChainReceiveAmountInfo'

export function useReceiveAmounts(): OrderTypeReceiveAmounts | null {
  const info = useGetReceiveAmountInfo()
  return useMemo(() => {
    return info ? getOrderTypeReceiveAmounts(info) : null
  }, [info])
}
