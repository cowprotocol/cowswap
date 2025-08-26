import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { DEFAULT_TRADE_DERIVED_STATE, TradeType, useBuildTradeDerivedState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { SwapDerivedState, swapDerivedStateAtom, swapRawStateAtom } from '../state/swapRawStateAtom'

export function useSwapDerivedState(): SwapDerivedState {
  return useAtomValue(swapDerivedStateAtom)
}

export function useFillSwapDerivedState(): void {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const updateDerivedState = useSetAtom(swapDerivedStateAtom)
  const rawState = useAtomValue(swapRawStateAtom)
  const derivedState = useBuildTradeDerivedState(swapRawStateAtom, true)

  const slippage = useTradeSlippage()

  useEffect(() => {
    updateDerivedState(
      isProviderNetworkUnsupported
        ? { ...DEFAULT_TRADE_DERIVED_STATE, isUnlocked: false }
        : {
            ...derivedState,
            slippage,
            tradeType: TradeType.SWAP,
            isUnlocked: rawState.isUnlocked,
          },
    )
  }, [derivedState, slippage, updateDerivedState, isProviderNetworkUnsupported, rawState.isUnlocked])
}
