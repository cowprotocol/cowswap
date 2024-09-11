import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useEnoughBalanceAndAllowance } from 'modules/tokens'

import { useReceiveAmountInfo } from './useReceiveAmountInfo'

export function useHasTradeEnoughAllowance() {
  const receiveAmountInfo = useReceiveAmountInfo()
  const { chainId, account } = useWalletInfo()

  const amount = receiveAmountInfo?.afterSlippage.sellAmount
  const checkAllowanceAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount,
    checkAllowanceAddress,
  })

  return enoughAllowance
}
