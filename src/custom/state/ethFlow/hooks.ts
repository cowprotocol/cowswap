import { useCurrency } from '@src/hooks/Tokens'
import { Field } from '@src/state/swap/actions'
import { useAtomValue } from 'jotai/utils'
import { useDetectNativeToken, useSwapState } from '../swap/hooks'
import { isUserNativeEthFlow } from './atoms'

export function useIsUserNativeEthFlow() {
  const {
    [Field.INPUT]: { currencyId },
  } = useSwapState()
  const currency = useCurrency(currencyId)
  // we check if user is selling native currency (not pure wrapping either)
  const { isNativeIn } = useDetectNativeToken({ currency })
  // get the user set native flow option
  const isUserNativeEthFlowSet = useAtomValue(isUserNativeEthFlow)

  return isNativeIn && isUserNativeEthFlowSet
}
