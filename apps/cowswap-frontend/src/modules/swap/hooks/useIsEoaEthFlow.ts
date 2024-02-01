import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { getEthFlowEnabled } from 'modules/swap/helpers/getEthFlowEnabled'

import { useIsSwapEth } from './useIsSwapEth'

export function useIsEoaEthFlow(): boolean {
  const isSwapEth = useIsSwapEth()

  const isSmartContractWallet = useIsSmartContractWallet()
  const isEnabled = getEthFlowEnabled(isSmartContractWallet === true)

  return isEnabled && isSwapEth
}
