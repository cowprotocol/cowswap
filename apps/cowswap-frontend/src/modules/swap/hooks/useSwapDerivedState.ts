import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai/index'
import { useEffect } from 'react'

import { TradeType, useBuildTradeDerivedState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'

import { swapDerivedStateAtom, swapRawStateAtom } from '../state/swapRawStateAtom'

export function useSwapDerivedState() {
  return useAtomValue(swapDerivedStateAtom)
}

export function useFillSwapDerivedState() {
  const updateDerivedState = useSetAtom(swapDerivedStateAtom)
  const derivedState = useBuildTradeDerivedState(swapRawStateAtom)
  const slippage = useTradeSlippage()

  useEffect(() => {
    updateDerivedState({
      ...derivedState,
      slippage,
      tradeType: TradeType.SWAP,
    })
  }, [derivedState, slippage, updateDerivedState])
}
