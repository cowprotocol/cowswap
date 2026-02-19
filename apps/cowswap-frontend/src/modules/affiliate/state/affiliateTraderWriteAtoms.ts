import { atom } from 'jotai'

import {
  affiliateTraderStateAtom,
  affiliateTraderStoredStateAtom,
  AffiliateTraderInMemoryState,
} from './affiliateTraderAtom'

import { formatRefCode } from '../lib/affiliateProgramUtils'

import type { TraderReferralCodeVerificationResult } from '../hooks/useAffiliateTraderVerification'

export const openTraderReferralCodeModalAtom = atom(null, (get, set, refCode?: string) => {
  const storedState = get(affiliateTraderStoredStateAtom)
  const savedCode = storedState?.savedCode
  set(affiliateTraderStateAtom, (prev) => {
    const sanitizedRefCode = refCode ? formatRefCode(refCode) : undefined
    const nextCode = resolveCode(prev, sanitizedRefCode, savedCode)
    const nextVerificationStatus = resolveVerificationStatus(prev, sanitizedRefCode, savedCode)

    return {
      ...prev,
      modalOpen: true,
      codeInput: nextCode,
      verificationStatus: nextVerificationStatus,
      ...clearVerificationMeta(),
    }
  })
})
export const closeTraderReferralCodeModalAtom = atom(null, (_get, set) => {
  set(affiliateTraderStateAtom, (prev) => ({
    ...prev,
    modalOpen: false,
  }))
})
export const setTraderReferralCodeInputAtom = atom(null, (_get, set, value: string) => {
  set(affiliateTraderStateAtom, (prev) => {
    const sanitized = normalizeRefCodeInput(value)
    const hasChanged = sanitized !== prev.codeInput

    return {
      ...prev,
      codeInput: sanitized,
      verificationStatus: prev.verificationStatus === 'pending' ? 'pending' : 'idle',
      ...(hasChanged ? clearVerificationMeta() : undefined),
    }
  })
})
export const saveTraderReferralCodeAtom = atom(null, (_get, set, code: string) => {
  set(affiliateTraderStateAtom, (prev) => {
    const sanitized = formatRefCode(code)

    if (!sanitized) {
      return {
        ...prev,
        codeInput: '',
        verificationStatus: 'idle',
        ...clearVerificationMeta(),
      }
    }

    return {
      ...prev,
      codeInput: sanitized,
      verificationStatus: 'pending',
      ...clearVerificationMeta(),
    }
  })
})
export const removeTraderReferralCodeAtom = atom(null, (_get, set) => {
  set(affiliateTraderStoredStateAtom, undefined)
  set(affiliateTraderStateAtom, (prev) => ({
    ...prev,
    codeInput: '',
    verificationStatus: 'idle',
    ...clearVerificationMeta(),
  }))
})
export const startTraderReferralVerificationAtom = atom(null, (_get, set, code: string) => {
  set(affiliateTraderStateAtom, (prev) => {
    const sanitized = formatRefCode(code)
    if (!sanitized) {
      return prev
    }

    return {
      ...prev,
      codeInput: sanitized,
      verificationStatus: 'checking',
      ...clearVerificationMeta(),
    }
  })
})
export const completeTraderReferralVerificationAtom = atom(
  null,
  (_get, set, result: TraderReferralCodeVerificationResult) => {
    set(affiliateTraderStateAtom, (prev) => ({
      ...prev,
      codeInput: 'code' in result ? result.code : prev.codeInput,
      verificationStatus: result.kind,
      ...toVerificationMeta(result),
    }))
  },
)
export const setTraderReferralSavedCodeAtom = atom(null, (_get, set, code?: string) => {
  const savedCode = code
  set(affiliateTraderStoredStateAtom, savedCode ? { savedCode, isLinked: false } : undefined)
  set(affiliateTraderStateAtom, (prev) => {
    if (!savedCode) {
      return {
        ...prev,
        codeInput: '',
        verificationStatus: 'idle',
        ...clearVerificationMeta(),
      }
    }

    return {
      ...prev,
      codeInput: savedCode,
      verificationStatus: 'pending',
      ...clearVerificationMeta(),
    }
  })
})
export const setRecoveredTraderReferralCodeAtom = atom(null, (_get, set, code?: string) => {
  const savedCode = code
  set(affiliateTraderStoredStateAtom, savedCode ? { savedCode, isLinked: true } : undefined)
})

function resolveCode(prev: AffiliateTraderInMemoryState, refCode: string | undefined, savedCode?: string): string {
  const candidate = refCode ?? prev.codeInput ?? savedCode ?? ''
  return normalizeRefCodeInput(candidate)
}

function resolveVerificationStatus(
  prev: AffiliateTraderInMemoryState,
  refCode: string | undefined,
  savedCode?: string,
): AffiliateTraderInMemoryState['verificationStatus'] {
  if (!refCode && savedCode && prev.verificationStatus === 'idle') {
    return 'pending'
  }

  if (!refCode || refCode === savedCode) {
    return prev.verificationStatus
  }

  return 'pending'
}

function normalizeRefCodeInput(value: string): string {
  return value.trim().toUpperCase()
}

function clearVerificationMeta(): Pick<
  AffiliateTraderInMemoryState,
  'verificationEligible' | 'verificationProgramParams' | 'verificationErrorMessage'
> {
  return {
    verificationEligible: undefined,
    verificationProgramParams: undefined,
    verificationErrorMessage: undefined,
  }
}

function toVerificationMeta(
  result: TraderReferralCodeVerificationResult,
): Pick<
  AffiliateTraderInMemoryState,
  'verificationEligible' | 'verificationProgramParams' | 'verificationErrorMessage'
> {
  if (result.kind === 'valid') {
    return {
      ...clearVerificationMeta(),
      verificationEligible: result.eligible,
      verificationProgramParams: result.programParams,
    }
  }

  if (result.kind === 'error') {
    return {
      ...clearVerificationMeta(),
      verificationErrorMessage: result.message,
    }
  }

  return clearVerificationMeta()
}
