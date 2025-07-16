import { useEnoughBalanceAndAllowance } from 'modules/tokens'

import { useReceiveAmountInfo } from './useReceiveAmountInfo'

export function useHasTradeEnoughAllowance(): boolean | undefined {
  const receiveAmountInfo = useReceiveAmountInfo()

  const amount = receiveAmountInfo?.afterSlippage.sellAmount

  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    amount,
  })

  return enoughAllowance
}
