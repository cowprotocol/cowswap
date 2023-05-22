import { useAtomValue } from 'jotai/utils'
import { limitOrdersWarningsAtom } from 'modules/limitOrders/state/limitOrdersWarningsAtom'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useMemo } from 'react'

export function useLimitOrdersWarningsAccepted(isConfirmScreen: boolean): boolean {
  const { expertMode } = useAtomValue(limitOrdersSettingsAtom)
  const { isPriceImpactAccepted, isRateImpactAccepted } = useAtomValue(limitOrdersWarningsAtom)

  return useMemo(() => {
    if (expertMode) {
      return true
    }

    if (isConfirmScreen) {
      return isRateImpactAccepted
    } else {
      return isPriceImpactAccepted
    }
  }, [isConfirmScreen, expertMode, isPriceImpactAccepted, isRateImpactAccepted])
}
