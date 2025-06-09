import { useCowAnalytics } from '@cowprotocol/analytics'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

export enum LimitOrderSettingsAction {
  TOGGLE_SETTINGS = 'Toggle Limit Order Settings',
  CUSTOM_RECIPIENT = 'Custom Recipient',
  PARTIAL_EXECUTIONS = 'Enable Partial Executions',
  PRICE_POSITION = 'Limit Price Position',
  LOCK_PRICE = 'Lock Limit Price',
  USD_MODE = 'Global USD Mode',
  TABLE_POSITION = 'Orders Table Position',
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLimitOrderSettingsAnalytics() {
  const analytics = useCowAnalytics()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const sendLimitOrderSettingsAnalytics = (action: string, label?: string) => {
    analytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIMIT_ORDER_SETTINGS,
      action,
      ...(label && { label }),
    })
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const sendToggleAnalytics = (action: LimitOrderSettingsAction, enable: boolean, customLabels?: [string, string]) => {
    sendLimitOrderSettingsAnalytics(
      action,
      customLabels ? (enable ? customLabels[0] : customLabels[1]) : enable ? 'Enabled' : 'Disabled',
    )
  }

  return {
    openSettings() {
      sendLimitOrderSettingsAnalytics(LimitOrderSettingsAction.TOGGLE_SETTINGS)
    },
    toggleCustomRecipient(enable: boolean) {
      sendToggleAnalytics(LimitOrderSettingsAction.CUSTOM_RECIPIENT, enable)
    },
    togglePartialExecutions(enable: boolean) {
      sendToggleAnalytics(LimitOrderSettingsAction.PARTIAL_EXECUTIONS, enable)
    },
    changeLimitPricePosition(oldPosition: string, newPosition: string) {
      sendLimitOrderSettingsAnalytics(LimitOrderSettingsAction.PRICE_POSITION, `${oldPosition} -> ${newPosition}`)
    },
    toggleLockLimitPrice(enable: boolean) {
      sendToggleAnalytics(LimitOrderSettingsAction.LOCK_PRICE, enable)
    },
    toggleGlobalUsdMode(enable: boolean) {
      sendToggleAnalytics(LimitOrderSettingsAction.USD_MODE, enable)
    },
    toggleOrdersTablePosition(enable: boolean) {
      sendToggleAnalytics(LimitOrderSettingsAction.TABLE_POSITION, enable, ['Left', 'Right'])
    },
  }
}
