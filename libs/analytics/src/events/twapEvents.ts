import { sendEvent } from '../googleAnalytics'
import { Category } from '../types'

type TwapWalletCompatibility = 'non-compatible' | 'compatible' | 'safe-that-could-be-converted'
export function twapWalletCompatibilityAnalytics(action: TwapWalletCompatibility) {
  sendEvent({
    category: Category.TWAP,
    action: `TWAP wallet compatibility ${action}`,
  })
}

type ModifySafeHandlerAction = 'enabled' | 'disabled'
export function modifySafeHandlerAnalytics(action: ModifySafeHandlerAction) {
  sendEvent({
    category: Category.TWAP,
    action: `Modify safe handler checkbox ${action}`,
  })
}

type TwapConversionType = 'initiated' | 'posted' | 'signed' | 'rejected'
export function twapConversionAnalytics(action: TwapConversionType, fallbackHandlerIsNotSet: boolean) {
  if (!fallbackHandlerIsNotSet) {
    return
  }

  sendEvent({
    category: Category.TWAP,
    action: `TWAP with conversion: ${action}`,
  })
}

export function openAdvancedOrdersTabAnalytics() {
  sendEvent({
    category: Category.TWAP,
    action: 'Open Advanced Orders Tab',
  })
}
