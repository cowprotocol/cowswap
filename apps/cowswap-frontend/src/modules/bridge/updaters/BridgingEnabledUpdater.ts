import { useEffect } from 'react'

import { useFeatureFlags, useSetIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useIsSafeApp } from '@cowprotocol/wallet'

import { useHasBridgeProviders } from 'entities/bridgeProvider'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useTradeTypeInfo } from 'modules/trade'

import { Routes } from 'common/constants/routes'

export function BridgingEnabledUpdater(): null {
  const tradeTypeInfo = useTradeTypeInfo()
  const setIsBridgingEnabled = useSetIsBridgingEnabled()
  const { isBridgingInSafeWidgetEnabled } = useFeatureFlags()
  const isSafeApp = useIsSafeApp()
  const { disableCrossChainSwap = false } = useInjectedWidgetParams()

  const isSwapOrHooksPage = tradeTypeInfo?.route === Routes.SWAP || tradeTypeInfo?.route === Routes.HOOKS
  const widgetInSafeApp = isSafeApp && isInjectedWidget()
  const shouldEnableInWidgetSafe = isBridgingInSafeWidgetEnabled ? true : !widgetInSafeApp

  const hasBridgeProviders = useHasBridgeProviders()

  const shouldEnableBridging =
    isSwapOrHooksPage && !disableCrossChainSwap && shouldEnableInWidgetSafe && hasBridgeProviders

  useEffect(() => {
    setIsBridgingEnabled(shouldEnableBridging)
  }, [setIsBridgingEnabled, shouldEnableBridging])

  return null
}
