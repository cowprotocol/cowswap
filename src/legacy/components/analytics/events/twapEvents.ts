import { sendEvent } from '../index'
import { Category } from '../types'

type TwapWalletCompatibility = 'non-compatible' | 'compatible' | 'safe-that-could-be-converted'
export function twapWalletCompatibilityAnalytics(action: TwapWalletCompatibility) {
  sendEvent({
    category: Category.TWAP,
    action: `TWAP wallet compatibility ${action}`,
  })
}

export function modifySafeHandlerAnalytics(action: boolean) {
  sendEvent({
    category: Category.TWAP,
    action: `Modify safe handler checkbox ${action ? 'enabled' : 'disabled'}`,
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
