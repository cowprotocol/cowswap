import { useAtomValue } from 'jotai'

import { ExtensibleFallbackVerification } from '../services/verifyExtensibleFallback'
import { fallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

export function useFallbackHandlerVerification() {
  return useAtomValue(fallbackHandlerVerificationAtom)
}

export function useIsFallbackHandlerRequired(): boolean {
  const verification = useFallbackHandlerVerification()

  return verification !== null && verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER
}

export function useIsFallbackHandlerCompatible(): boolean {
  const verification = useFallbackHandlerVerification()

  return verification !== null && verification === ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER
}
