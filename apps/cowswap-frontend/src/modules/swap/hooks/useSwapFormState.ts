import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useIsSmartContractWallet, useIsTxBundlingSupported } from '@cowprotocol/wallet'

import { useIsHooksTradeType } from 'modules/trade'

import { useSwapDerivedState } from './useSwapDerivedState'

export enum SwapFormState {
  SwapWithWrappedToken = 'SwapWithWrappedToken',
  RegularEthFlowSwap = 'EthFlowSwap',
  WrapAndSwap = 'WrapAndSwap',
  SellNativeInHooks = 'SellNativeInHooks',
}

export function useSwapFormState(): SwapFormState | null {
  const state = useSwapDerivedState()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isBundlingSupported = useIsTxBundlingSupported()
  const isHooksStore = useIsHooksTradeType()

  return useMemo(() => {
    if (state.inputCurrency && getIsNativeToken(state.inputCurrency)) {
      if (isHooksStore) return SwapFormState.SellNativeInHooks

      if (!isSmartContractWallet) {
        return SwapFormState.RegularEthFlowSwap
      } else if (isBundlingSupported) {
        return SwapFormState.WrapAndSwap
      } else {
        return SwapFormState.SwapWithWrappedToken
      }
    }

    return null
  }, [state, isSmartContractWallet, isBundlingSupported, isHooksStore])
}
