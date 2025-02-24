import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai/index'
import { useEffect } from 'react'

import { DEFAULT_TRADE_DERIVED_STATE, TradeType, useBuildTradeDerivedState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { swapDerivedStateAtom, swapRawStateAtom } from '../state/swapRawStateAtom'

export function useSwapDerivedState() {
  return useAtomValue(swapDerivedStateAtom)
}

export function useFillSwapDerivedState() {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const updateDerivedState = useSetAtom(swapDerivedStateAtom)
  const derivedState = useBuildTradeDerivedState(swapRawStateAtom)
  const slippage = useTradeSlippage()

  useEffect(() => {
    updateDerivedState(
      isProviderNetworkUnsupported
        ? DEFAULT_TRADE_DERIVED_STATE
        : {
            ...derivedState,
            slippage,
            tradeType: TradeType.SWAP,
          },
    )
  }, [derivedState, slippage, updateDerivedState, isProviderNetworkUnsupported])
}
