import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useEnoughBalanceAndAllowance } from 'modules/tokens'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export function useLimitHasEnoughAllowance(): boolean | undefined {
  const state = useLimitOrdersDerivedState()
  const { chainId, account } = useWalletInfo()

  const checkAllowanceAddress = GP_VAULT_RELAYER[chainId]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: state.slippageAdjustedSellAmount || undefined,
    checkAllowanceAddress,
  })
  return enoughAllowance
}
