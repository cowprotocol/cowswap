import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TradeType, useBuildTradeDerivedState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import {
  DEFAULT_SWAP_DERIVED_STATE,
  SwapDerivedState,
  swapDerivedStateAtom,
  swapRawStateAtom,
} from '../state/swapRawStateAtom'

export function useSwapDerivedState(): SwapDerivedState {
  return useAtomValue(swapDerivedStateAtom)
}

export function useSwapDerivedStateToFill(): SwapDerivedState {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const rawState = useAtomValue(swapRawStateAtom)
  const derivedState = useBuildTradeDerivedState(swapRawStateAtom, true)

  const slippage = useTradeSlippage()

  return useMemo(() => {
    return isProviderNetworkUnsupported
      ? DEFAULT_SWAP_DERIVED_STATE
      : {
          ...derivedState,
          slippage,
          tradeType: TradeType.SWAP,
          isUnlocked: rawState.isUnlocked,
        }
  }, [derivedState, slippage, isProviderNetworkUnsupported, rawState.isUnlocked])
}
