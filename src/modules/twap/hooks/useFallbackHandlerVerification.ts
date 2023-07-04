import { useAtomValue } from 'jotai/utils'

import { ExtensibleFallbackVerification } from '../services/verifyExtensibleFallback'
import { fallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

export function useFallbackHandlerVerification() {
  return useAtomValue(fallbackHandlerVerificationAtom)
}

export function useIsFallbackHandlerRequired() {
  return useFallbackHandlerVerification() !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER
}
