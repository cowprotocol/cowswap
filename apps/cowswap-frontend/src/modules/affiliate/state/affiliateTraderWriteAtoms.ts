import { atom } from 'jotai'

import { affiliateTraderStateAtom, affiliateTraderStoredCodeAtom } from './affiliateTraderAtom'

import {
  TraderReferralCodeIncomingReason,
  AffiliateTraderState,
  TraderReferralCodeVerificationStatus,
} from '../lib/affiliateProgramTypes'
import { formatRefCode } from '../lib/affiliateProgramUtils'

export const openTraderReferralCodeModalAtom = atom(null, (get, set, refCode?: string) => {
  const storedCode = get(affiliateTraderStoredCodeAtom)
  const savedCode = storedCode ? formatRefCode(storedCode) : undefined
  set(affiliateTraderStateAtom, (prev) => {
    const sanitizedIncoming = refCode ? formatRefCode(refCode) : undefined
    const isLinked = prev.verification.kind === 'linked'
    const nextInputCode = resolveInputCode(prev, sanitizedIncoming, isLinked, savedCode)
    const nextVerification = resolveVerification(prev, sanitizedIncoming, isLinked, savedCode)

    return {
      ...prev,
      modalOpen: true,
      editMode: false,
      incomingCode: sanitizedIncoming,
      incomingCodeReason: undefined,
      inputCode: nextInputCode,
      verification: nextVerification,
    }
  })
})
export const closeTraderReferralCodeModalAtom = atom(null, (_get, set) => {
  set(affiliateTraderStateAtom, (prev) => ({
    ...prev,
    modalOpen: false,
    editMode: false,
    incomingCode: undefined,
    incomingCodeReason: undefined,
  }))
})
export const setTraderReferralCodeInputAtom = atom(null, (_get, set, value: string) => {
  set(affiliateTraderStateAtom, (prev) => {
    const sanitized = normalizeRefCodeInput(value)
    const hasChanged = sanitized !== prev.inputCode
    const shouldClearIncoming = Boolean(prev.incomingCode) && sanitized !== prev.incomingCode

    return {
      ...prev,
      inputCode: sanitized,
      incomingCode: shouldClearIncoming ? undefined : prev.incomingCode,
      incomingCodeReason: hasChanged ? undefined : prev.incomingCodeReason,
      verification: prev.verification.kind === 'pending' ? prev.verification : { kind: 'idle' },
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
        inputCode: '',
        verification: { kind: 'idle' },
      }
    }

    return {
      ...prev,
      inputCode: sanitized,
      verification: { kind: 'pending', code: sanitized },
      editMode: false,
    }
  })
})
export const removeTraderReferralCodeAtom = atom(null, (_get, set) => {
  set(affiliateTraderStoredCodeAtom, undefined)
  set(affiliateTraderStateAtom, (prev) => ({
    ...prev,
    inputCode: '',
    incomingCode: undefined,
    incomingCodeReason: undefined,
    verification: { kind: 'idle' },
  }))
})
export const setTraderReferralIncomingCodeAtom = atom(null, (_get, set, code?: string) => {
  set(affiliateTraderStateAtom, (prev) => ({
    ...prev,
    incomingCode: code ? formatRefCode(code) : undefined,
    incomingCodeReason: undefined,
  }))
})
export const setTraderReferralIncomingCodeReasonAtom = atom(
  null,
  (_get, set, reason?: TraderReferralCodeIncomingReason) => {
    set(affiliateTraderStateAtom, (prev) => ({ ...prev, incomingCodeReason: reason }))
  },
)
export const startTraderReferralVerificationAtom = atom(null, (_get, set, code: string) => {
  set(affiliateTraderStateAtom, (prev) => {
    const sanitized = formatRefCode(code)
    if (!sanitized) {
      return prev
    }

    return {
      ...prev,
      verification: { kind: 'checking', code: sanitized },
    }
  })
})
export const completeTraderReferralVerificationAtom = atom(
  null,
  (_get, set, status: TraderReferralCodeVerificationStatus) => {
    set(affiliateTraderStateAtom, (prev) => ({
      ...prev,
      verification: status,
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
        inputCode: '',
        verification: { kind: 'idle' },
      }
    }

    return {
      ...prev,
      inputCode: savedCode,
      verification: { kind: 'pending', code: savedCode },
    }
  })
})

function resolveInputCode(
  prev: AffiliateTraderState,
  incomingCode: string | undefined,
  isLinked: boolean,
  savedCode?: string,
): string {
  const candidate = isLinked ? savedCode || prev.inputCode || '' : (incomingCode ?? prev.inputCode ?? savedCode ?? '')
  return normalizeRefCodeInput(candidate)
}

function resolveVerification(
  prev: AffiliateTraderState,
  incomingCode: string | undefined,
  isLinked: boolean,
  savedCode?: string,
): TraderReferralCodeVerificationStatus {
  if (!incomingCode && savedCode && !isLinked && prev.verification.kind === 'idle') {
    return { kind: 'pending', code: savedCode }
  }

  if (!incomingCode || incomingCode === savedCode || isLinked) {
    return prev.verification
  }

  return { kind: 'pending', code: incomingCode }
}

function normalizeRefCodeInput(value: string): string {
  return value.trim().toUpperCase()
}
