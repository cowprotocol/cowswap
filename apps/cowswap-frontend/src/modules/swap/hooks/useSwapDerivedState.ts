import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { TradeType, useBuildTradeDerivedState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
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

export function useFillSwapDerivedState(): void {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const updateDerivedState = useSetAtom(swapDerivedStateAtom)
  const rawState = useAtomValue(swapRawStateAtom)
  const derivedState = useBuildTradeDerivedState(swapRawStateAtom, true)

  const slippage = useTradeSlippage()

  useEffect(() => {
    updateDerivedState(
      isProviderNetworkUnsupported || isProviderNetworkDeprecated
        ? DEFAULT_SWAP_DERIVED_STATE
        : {
            ...derivedState,
            slippage,
            tradeType: TradeType.SWAP,
            isUnlocked: rawState.isUnlocked,
          },
    )
  }, [
    derivedState,
    slippage,
    updateDerivedState,
    isProviderNetworkUnsupported,
    isProviderNetworkDeprecated,
    rawState.isUnlocked,
  ])
}
