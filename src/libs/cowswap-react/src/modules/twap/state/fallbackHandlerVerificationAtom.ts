import { atom } from 'jotai'

import { ExtensibleFallbackVerification } from '../services/verifyExtensibleFallback'

export const fallbackHandlerVerificationAtom = atom<ExtensibleFallbackVerification | null>(null)
