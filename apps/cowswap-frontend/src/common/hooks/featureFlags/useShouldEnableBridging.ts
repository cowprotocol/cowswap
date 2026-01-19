import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useIsSafeApp } from '@cowprotocol/wallet'

// eslint-disable-next-line no-restricted-imports
import { useInjectedWidgetParams } from 'modules/injectedWidget'

export function useShouldEnableBridging(): boolean {
  const { isBridgingInSafeWidgetEnabled } = useFeatureFlags()
  const isSafeApp = useIsSafeApp()
  const { disableCrossChainSwap = false } = useInjectedWidgetParams()

  const widgetInSafeApp = isSafeApp && isInjectedWidget()
  const shouldEnableInWidgetSafe = isBridgingInSafeWidgetEnabled ? true : !widgetInSafeApp

  return !disableCrossChainSwap && shouldEnableInWidgetSafe
}
