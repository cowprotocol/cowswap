import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { limitOrdersWarningsAtom } from 'modules/limitOrders/state/limitOrdersWarningsAtom'

export function useLimitOrdersWarningsAccepted(isConfirmScreen: boolean): boolean {
  const { isPriceImpactAccepted, isRateImpactAccepted } = useAtomValue(limitOrdersWarningsAtom)

  return useMemo(() => {
    if (isConfirmScreen) {
      return isRateImpactAccepted
    } else {
      return isPriceImpactAccepted
    }
  }, [isConfirmScreen, isPriceImpactAccepted, isRateImpactAccepted])
}
