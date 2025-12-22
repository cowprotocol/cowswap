import { useEffect } from 'react'

import { useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from 'common/constants/routes'

export function BridgingEnabledUpdater(): null {
  const tradeTypeInfo = useTradeTypeInfo()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()
  const { disableCrossChainSwap = false } = useInjectedWidgetParams()

  const shouldEnableBridging = tradeTypeInfo?.route === Routes.SWAP && !disableCrossChainSwap

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging)
  }, [setIsBridgingEnabled, shouldEnableBridging])

  return null
}
