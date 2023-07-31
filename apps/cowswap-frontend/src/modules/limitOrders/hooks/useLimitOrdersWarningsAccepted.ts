import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { limitOrdersSettingsAtom } from '../state/limitOrdersSettingsAtom'
import { limitOrdersWarningsAtom } from '../state/limitOrdersWarningsAtom'

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
