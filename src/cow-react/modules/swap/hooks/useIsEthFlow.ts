import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { getEthFlowEnabled } from '@cow/modules/swap/helpers/getEthFlowEnabled'
import { useIsSmartContractWallet } from '@cow/common/hooks/useIsSmartContractWallet'

export function useIsEthFlow(): boolean {
  const { isNativeIn, isWrapOrUnwrap } = useDetectNativeToken()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isEnabled = getEthFlowEnabled(isSmartContractWallet)

  return isEnabled && isNativeIn && !isWrapOrUnwrap
}
