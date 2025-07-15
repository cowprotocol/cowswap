import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useEnoughBalanceAndAllowance } from 'modules/tokens'

import { useGetReceiveAmountInfo } from './useGetReceiveAmountInfo'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useHasTradeEnoughAllowance() {
  const receiveAmountInfo = useGetReceiveAmountInfo()
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
