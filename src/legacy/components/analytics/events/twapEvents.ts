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
