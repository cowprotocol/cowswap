import { useAtomValue } from 'jotai'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ExtensibleFallbackVerification } from '../services/verifyExtensibleFallback'
import { fallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

export function useFallbackHandlerVerification(): ExtensibleFallbackVerification | null {
  const { account } = useWalletInfo()
  const state = useAtomValue(fallbackHandlerVerificationAtom)

  // For backward compatibility check both upper and lower case
  return account ? state[account.toLowerCase()] || state[account] || null : null
}

export function useIsFallbackHandlerRequired(): boolean {
  const verification = useFallbackHandlerVerification()

  return verification !== null && verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER
}

export function useIsFallbackHandlerCompatible(): boolean {
  const verification = useFallbackHandlerVerification()

  return verification !== null && verification === ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER
}
