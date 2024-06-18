import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useEnoughBalanceAndAllowance } from 'modules/tokens'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export function useLimitHasEnoughAllowance(): boolean | undefined {
  const state = useLimitOrdersDerivedState()
  const { chainId, account } = useWalletInfo()

  const checkAllowanceAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: state.slippageAdjustedSellAmount || undefined,
    checkAllowanceAddress,
  })
  return enoughAllowance
}
