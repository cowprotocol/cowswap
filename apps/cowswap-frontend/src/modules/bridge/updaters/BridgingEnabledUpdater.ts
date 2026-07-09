import { useEffect } from 'react'

import { useFeatureFlags, useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useIsSafeApp } from '@cowprotocol/wallet'

import { useHasBridgeProviders } from 'entities/bridgeProvider'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from 'common/constants/routes'

export function BridgingEnabledUpdater(): null {
  const tradeTypeInfo = useTradeTypeInfo()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()
  const { isBridgingInSafeWidgetEnabled } = useFeatureFlags()
  const isSafeApp = useIsSafeApp()
  const { disableCrossChainSwap = false } = useInjectedWidgetParams()

  // Bridging is intentionally disabled on the Hooks tab: Hooks orders are partially-fillable,
  // and bridge orders do not support partial fills, which can leave the order stuck mid-bridge.
  const isSwapPage = tradeTypeInfo?.route === Routes.SWAP
  const widgetInSafeApp = isSafeApp && isInjectedWidget()
  const shouldEnableInWidgetSafe = isBridgingInSafeWidgetEnabled ? true : !widgetInSafeApp

  const hasBridgeProviders = useHasBridgeProviders()

  const shouldEnableBridging = isSwapPage && !disableCrossChainSwap && shouldEnableInWidgetSafe && hasBridgeProviders

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging)
  }, [setIsBridgingEnabled, shouldEnableBridging])

  return null
}
