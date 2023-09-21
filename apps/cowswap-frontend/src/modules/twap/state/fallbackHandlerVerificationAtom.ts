import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

import { ExtensibleFallbackVerification } from '../services/verifyExtensibleFallback'

type FallbackVerificationsState = {
  [walletAddress: string]: ExtensibleFallbackVerification
}

export const { atom: fallbackHandlerVerificationAtom, updateAtom: updateFallbackHandlerVerificationAtom } =
  atomWithPartialUpdate(atomWithStorage<FallbackVerificationsState>('fallbackHandlerVerification:v2', {}))
