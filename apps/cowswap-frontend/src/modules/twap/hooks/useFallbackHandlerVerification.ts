import { useAtomValue } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ExtensibleFallbackVerification } from '../services/verifyExtensibleFallback'
import { fallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

export function useFallbackHandlerVerification(): ExtensibleFallbackVerification | null {
  const { account } = useWalletInfo()
  const state = useAtomValue(fallbackHandlerVerificationAtom)

  // For backward compatibility check both upper and lower case
  return account ? state[getAddressKey(account)] || state[account] || null : null
}

export function useIsFallbackHandlerCompatible(): boolean {
  const verification = useFallbackHandlerVerification()

  return verification !== null && verification === ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER
}

export function useIsFallbackHandlerRequired(): boolean {
  const verification = useFallbackHandlerVerification()

  return verification !== null && verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER
}
