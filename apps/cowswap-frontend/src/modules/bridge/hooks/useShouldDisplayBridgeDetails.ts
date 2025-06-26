import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'

import { useIsCurrentTradeBridging, useIsHooksTradeType } from 'modules/trade'

export function useShouldDisplayBridgeDetails(): boolean {
  const isHooksTabEnabled = useIsHooksTradeType()
  const isBridgingEnabled = useIsBridgingEnabled()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  return isBridgingEnabled && isCurrentTradeBridging && !isHooksTabEnabled
}
