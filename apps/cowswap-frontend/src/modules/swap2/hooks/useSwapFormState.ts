import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useIsBundlingSupported, useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useSwapDerivedState } from './useSwapDerivedState'

export enum SwapFormState {
  SwapWithWrappedToken = 'SwapWithWrappedToken',
  RegularEthFlowSwap = 'EthFlowSwap',
  WrapAndSwap = 'WrapAndSwap',
}

export function useSwapFormState(): SwapFormState | null {
  const state = useSwapDerivedState()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isBundlingSupported = useIsBundlingSupported()

  return useMemo(() => {
    if (state.inputCurrency && getIsNativeToken(state.inputCurrency)) {
      if (!isSmartContractWallet) {
        return SwapFormState.RegularEthFlowSwap
      } else if (isBundlingSupported) {
        return SwapFormState.WrapAndSwap
      } else {
        return SwapFormState.SwapWithWrappedToken
      }
    }

    return null
  }, [state, isSmartContractWallet, isBundlingSupported])
}
