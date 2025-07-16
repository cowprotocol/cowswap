import { useEnoughAllowance } from 'common/hooks/useEnoughBalance'

import { useReceiveAmountInfo } from './useReceiveAmountInfo'

export function useHasTradeEnoughAllowance(): boolean | undefined {
  const receiveAmountInfo = useReceiveAmountInfo()

  const amount = receiveAmountInfo?.afterSlippage.sellAmount

  return useEnoughAllowance(amount)
}
