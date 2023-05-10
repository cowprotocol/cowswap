import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { getEthFlowEnabled } from '@cow/modules/swap/helpers/getEthFlowEnabled'
import { useIsSmartContractWallet } from '@cow/common/hooks/useIsSmartContractWallet'
import { useIsWrapOrUnwrap } from '@cow/modules/trade/hooks/useIsWrapOrUnwrap'

export function useIsEthFlow(): boolean {
  const { isNativeIn } = useDetectNativeToken()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isEnabled = getEthFlowEnabled(isSmartContractWallet)

  return isEnabled && isNativeIn && !isWrapOrUnwrap
}
