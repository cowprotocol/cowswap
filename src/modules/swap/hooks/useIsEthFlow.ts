import { useDetectNativeToken } from 'modules/swap/hooks/useDetectNativeToken'
import { getEthFlowEnabled } from 'modules/swap/helpers/getEthFlowEnabled'
import { useIsSmartContractWallet } from 'common/hooks/useIsSmartContractWallet'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

export function useIsEthFlow(): boolean {
  const { isNativeIn } = useDetectNativeToken()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isEnabled = getEthFlowEnabled(isSmartContractWallet)

  return isEnabled && isNativeIn && !isWrapOrUnwrap
}
