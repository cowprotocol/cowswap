import { getEthFlowEnabled } from 'modules/swap/helpers/getEthFlowEnabled'
import { useDetectNativeToken } from 'modules/swap/hooks/useDetectNativeToken'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

import { useIsSmartContractWallet } from 'common/hooks/useIsSmartContractWallet'

export function useIsEthFlow(): boolean {
  const { isNativeIn } = useDetectNativeToken()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isEnabled = getEthFlowEnabled(isSmartContractWallet)

  return isEnabled && isNativeIn && !isWrapOrUnwrap
}
