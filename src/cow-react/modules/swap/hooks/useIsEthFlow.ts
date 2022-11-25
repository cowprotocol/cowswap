import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { getEthFlowEnabled } from '@cow/modules/swap/helpers/getEthFlowEnabled'
import { useIsSmartContractWallet } from '@cow/common/hooks/useIsSmartContractWallet'
import { useSwapState } from 'state/swap/hooks'
import { Field } from 'state/swap/actions'

export function useIsEthFlow(): boolean {
  const { isNativeIn, isWrapOrUnwrap } = useDetectNativeToken()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isEnabled = getEthFlowEnabled(isSmartContractWallet)

  return isEnabled && isNativeIn && !isWrapOrUnwrap
}

export function useIsEthFlowBuyOrder(): boolean {
  const isEthFlow = useIsEthFlow()
  const { isNativeIn } = useDetectNativeToken()
  const { independentField } = useSwapState()

  return isEthFlow && isNativeIn && independentField === Field.OUTPUT
}
