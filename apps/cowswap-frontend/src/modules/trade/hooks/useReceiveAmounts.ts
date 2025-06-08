import { useReceiveAmountInfo } from './useReceiveAmountInfo'

import { getOrderTypeReceiveAmounts } from '../utils/getReceiveAmountInfo'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useReceiveAmounts() {
  const info = useReceiveAmountInfo()
  return info ? getOrderTypeReceiveAmounts(info) : null
}
