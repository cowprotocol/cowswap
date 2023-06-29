import { useAtomValue } from 'jotai/utils'

import { fallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

export function useFallbackHandlerVerification() {
  return useAtomValue(fallbackHandlerVerificationAtom)
}
