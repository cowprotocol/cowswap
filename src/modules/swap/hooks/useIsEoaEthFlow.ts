import { getEthFlowEnabled } from 'modules/swap/helpers/getEthFlowEnabled'

import { useIsSmartContractWallet } from 'common/hooks/useIsSmartContractWallet'

import { useIsSwapEth } from './useIsSwapEth'

export function useIsEoaEthFlow(): boolean {
  const isSwapEth = useIsSwapEth()

  const isSmartContractWallet = useIsSmartContractWallet()
  const isEnabled = getEthFlowEnabled(isSmartContractWallet)

  return isEnabled && isSwapEth
}
