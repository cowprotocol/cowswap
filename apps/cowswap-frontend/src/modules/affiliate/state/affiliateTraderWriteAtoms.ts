import { atom } from 'jotai'

import { affiliateTraderStateAtom, affiliateTraderStoredCodeAtom } from './affiliateTraderAtom'

import { AffiliateTraderState, TraderReferralCodeVerificationResult } from '../lib/affiliateProgramTypes'
import { formatRefCode } from '../lib/affiliateProgramUtils'

export const openTraderReferralCodeModalAtom = atom(null, (get, set, refCode?: string) => {
  const storedCode = get(affiliateTraderStoredCodeAtom)
  const savedCode = storedCode ? formatRefCode(storedCode) : undefined
  set(affiliateTraderStateAtom, (prev) => {
    const sanitizedRefCode = refCode ? formatRefCode(refCode) : undefined
    const isLinked = prev.verificationStatus === 'linked'
    const nextCode = resolveCode(prev, sanitizedRefCode, isLinked, savedCode)
    const nextVerificationStatus = resolveVerificationStatus(prev, sanitizedRefCode, isLinked, savedCode)
    const codeOrigin: AffiliateTraderState['codeOrigin'] = sanitizedRefCode ? 'url' : savedCode ? 'stored' : 'manual'

    return {
      ...prev,
      modalOpen: true,
      editMode: false,
      code: nextCode,
      codeOrigin,
      verificationStatus: nextVerificationStatus,
      ...clearVerificationMeta(),
    }
  })
})
export const closeTraderReferralCodeModalAtom = atom(null, (_get, set) => {
  set(affiliateTraderStateAtom, (prev) => ({
    ...prev,
    modalOpen: false,
    editMode: false,
  }))
})
export const setTraderReferralCodeInputAtom = atom(null, (_get, set, value: string) => {
  set(affiliateTraderStateAtom, (prev) => {
    const sanitized = normalizeRefCodeInput(value)
    const hasChanged = sanitized !== prev.code

    return {
      ...prev,
      code: sanitized,
      codeOrigin: 'manual',
      verificationStatus: prev.verificationStatus === 'pending' ? 'pending' : 'idle',
      ...(hasChanged ? clearVerificationMeta() : undefined),
    }
  })
})
export const enableTraderReferralCodeEditModeAtom = atom(null, (_get, set) => {
  set(affiliateTraderStateAtom, (prev) => ({ ...prev, editMode: true }))
})
export const disableTraderReferralCodeEditModeAtom = atom(null, (_get, set) => {
  set(affiliateTraderStateAtom, (prev) => ({ ...prev, editMode: false }))
})
export const saveTraderReferralCodeAtom = atom(null, (_get, set, code: string) => {
  set(affiliateTraderStateAtom, (prev) => {
    const sanitized = formatRefCode(code)

    if (!sanitized) {
      return {
        ...prev,
        code: '',
        codeOrigin: 'none',
        verificationStatus: 'idle',
        ...clearVerificationMeta(),
      }
    }

    return {
      ...prev,
      code: sanitized,
      codeOrigin: 'manual',
      verificationStatus: 'pending',
      ...clearVerificationMeta(),
      editMode: false,
    }
  })
})
export const removeTraderReferralCodeAtom = atom(null, (_get, set) => {
  set(affiliateTraderStoredCodeAtom, undefined)
  set(affiliateTraderStateAtom, (prev) => ({
    ...prev,
    code: '',
    codeOrigin: 'none',
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
      code: sanitized,
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
      code: 'code' in result ? result.code : prev.code,
      verificationStatus: result.kind,
      ...toVerificationMeta(result),
    }))
  },
)
export const setTraderReferralSavedCodeAtom = atom(null, (_get, set, code?: string) => {
  const savedCode = code ? formatRefCode(code) : undefined
  set(affiliateTraderStoredCodeAtom, savedCode)
  set(affiliateTraderStateAtom, (prev) => {
    if (!savedCode) {
      return {
        ...prev,
        code: '',
        codeOrigin: 'none',
        verificationStatus: 'idle',
        ...clearVerificationMeta(),
      }
    }

    return {
      ...prev,
      code: savedCode,
      codeOrigin: 'stored',
      verificationStatus: 'pending',
      ...clearVerificationMeta(),
    }
  })
})

function resolveCode(
  prev: AffiliateTraderState,
  refCode: string | undefined,
  isLinked: boolean,
  savedCode?: string,
): string {
  const candidate = isLinked ? savedCode || prev.code || '' : (refCode ?? prev.code ?? savedCode ?? '')
  return normalizeRefCodeInput(candidate)
}

function resolveVerificationStatus(
  prev: AffiliateTraderState,
  refCode: string | undefined,
  isLinked: boolean,
  savedCode?: string,
): AffiliateTraderState['verificationStatus'] {
  if (!refCode && savedCode && !isLinked && prev.verificationStatus === 'idle') {
    return 'pending'
  }

  if (!refCode || refCode === savedCode || isLinked) {
    return prev.verificationStatus
  }

  return 'pending'
}

function normalizeRefCodeInput(value: string): string {
  return value.trim().toUpperCase()
}

function clearVerificationMeta(): Pick<
  AffiliateTraderState,
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
): Pick<AffiliateTraderState, 'verificationEligible' | 'verificationProgramParams' | 'verificationErrorMessage'> {
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
