import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { useBuildTradeDerivedState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { TradeType } from 'common/modules/tradeNavigation'

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
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const rawState = useAtomValue(swapRawStateAtom)
  const derivedState = useBuildTradeDerivedState(swapRawStateAtom, true)
  const isUnlocked =
    rawState.isUnlocked || isInjectedWidget() || isProviderNetworkUnsupported || isProviderNetworkDeprecated

  const slippage = useTradeSlippage()

  return useMemo(() => {
    return isProviderNetworkUnsupported
      ? { ...DEFAULT_SWAP_DERIVED_STATE, isUnlocked }
      : {
          ...derivedState,
          slippage,
          tradeType: TradeType.SWAP,
          isUnlocked,
        }
  }, [derivedState, slippage, isProviderNetworkUnsupported, isUnlocked])
}
