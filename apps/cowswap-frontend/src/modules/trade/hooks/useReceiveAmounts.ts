import { useReceiveAmountInfo } from './useReceiveAmountInfo'

import { getOrderTypeReceiveAmounts } from '../utils/getReceiveAmountInfo'

export function useReceiveAmounts() {
  const info = useReceiveAmountInfo()
  return info ? getOrderTypeReceiveAmounts(info) : null
}
