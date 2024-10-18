import { useAtomValue } from 'jotai'

import { limitOrdersWarningsAtom } from 'modules/limitOrders/state/limitOrdersWarningsAtom'
import { useIsNoImpactWarningAccepted } from 'modules/trade'

export function useLimitOrdersWarningsAccepted(isConfirmScreen: boolean): boolean {
  const { isRateImpactAccepted } = useAtomValue(limitOrdersWarningsAtom)
  const isPriceImpactAccepted = useIsNoImpactWarningAccepted()

  if (isConfirmScreen) {
    return isRateImpactAccepted
  } else {
    return isPriceImpactAccepted
  }
}
