import { useAtomValue } from 'jotai'

import { useIsNoImpactWarningAccepted } from 'modules/trade'

import { useIsFallbackHandlerRequired } from './useFallbackHandlerVerification'

import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useAreWarningsAccepted(): boolean {
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  if (isFallbackHandlerRequired) return isFallbackHandlerSetupAccepted

  return isNoImpactWarningAccepted
}
