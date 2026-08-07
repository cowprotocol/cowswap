import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useIsSmartContractWallet, useIsTxBundlingSupported } from '@cowprotocol/wallet'

import { useIsHooksTradeType } from 'modules/trade'

import { useSwapDerivedState } from './useSwapDerivedState'

export enum SwapFormState {
  SwapWithWrappedToken = 'SwapWithWrappedToken',
  RegularEthFlowSwap = 'EthFlowSwap',
  WrapAndSwap = 'WrapAndSwap',
  WrapAndSwapAndBridge = 'WrapAndSwapAndBridge',
  SellNativeInHooks = 'SellNativeInHooks',
  SolanaWrapAndDelegate = 'SolanaWrapAndDelegate',
}

export function useSwapFormState(): SwapFormState | null {
  const state = useSwapDerivedState()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isBundlingSupported = useIsTxBundlingSupported()
  const isHooksStore = useIsHooksTradeType()

  return useMemo(() => {
    if (state.inputCurrency && getIsNativeToken(state.inputCurrency)) {
      if (isHooksStore) return SwapFormState.SellNativeInHooks
      if (isSolanaChain(state.inputCurrency.chainId)) return SwapFormState.SolanaWrapAndDelegate

      const isBridging =
        state.inputCurrency && state.outputCurrency && state.inputCurrency.chainId !== state.outputCurrency.chainId

      if (!isSmartContractWallet) {
        return SwapFormState.RegularEthFlowSwap
      } else if (isBundlingSupported) {
        return isBridging ? SwapFormState.WrapAndSwapAndBridge : SwapFormState.WrapAndSwap
      } else {
        return SwapFormState.SwapWithWrappedToken
      }
    }

    return null
  }, [state, isSmartContractWallet, isBundlingSupported, isHooksStore])
}
