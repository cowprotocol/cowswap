import { useEffect } from 'react'

import { useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { useShouldEnableBridging } from 'common/hooks/featureFlags/useShouldEnableBridging'

export function BridgingEnabledUpdater(): null {
  const tradeTypeInfo = useTradeTypeInfo()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()

  const isSwapPage = tradeTypeInfo?.route === Routes.SWAP || tradeTypeInfo?.route === Routes.BRIDGE

  const shouldEnableBridging = useShouldEnableBridging()
  const enableBridging = isSwapPage && shouldEnableBridging

  useEffect(() => {
    setIsBridgingEnabled(enableBridging)
  }, [setIsBridgingEnabled, enableBridging])

  return null
}
