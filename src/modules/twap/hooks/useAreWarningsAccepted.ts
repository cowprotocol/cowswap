import { useAtomValue } from 'jotai'

import { useIsFallbackHandlerRequired } from './useFallbackHandlerVerification'
import { useTwapWarningsContext } from './useTwapWarningsContext'

import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useAreWarningsAccepted(): boolean {
  const { isPriceImpactAccepted, isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const { showPriceImpactWarning } = useTwapWarningsContext()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  if (showPriceImpactWarning) return isPriceImpactAccepted

  if (isFallbackHandlerRequired) return isFallbackHandlerSetupAccepted

  return true
}
