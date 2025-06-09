import { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { ForcedOrderDeadline, resolveFlexibleConfig, SupportedChainId, TradeType } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from './useInjectedWidgetParams'

/**
 * Returns the deadline set in the widget for the specific order type in minutes, if any
 *
 * Additional validation is needed
 */
export function useInjectedWidgetDeadline(tradeType: TradeType): number | undefined {
  const { forcedOrderDeadline } = useInjectedWidgetParams()
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    if (!isInjectedWidget()) {
      return
    }

    return getDeadline(forcedOrderDeadline, chainId, tradeType)
  }, [tradeType, forcedOrderDeadline, chainId])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getDeadline(deadline: ForcedOrderDeadline | undefined, chainId: SupportedChainId, tradeType: TradeType) {
  if (!deadline) {
    return
  }

  return resolveFlexibleConfig(deadline, chainId, tradeType)
}
