import { useEnoughAllowance } from 'common/hooks/useEnoughAllowance'

import { useGetReceiveAmountInfo } from './useGetReceiveAmountInfo'

export function useHasTradeEnoughAllowance(): boolean | undefined {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const amount = receiveAmountInfo?.amountsToSign.sellAmount

  return useEnoughAllowance(amount)
}
