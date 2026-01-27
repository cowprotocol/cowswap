import { Dispatch, SetStateAction, useEffect } from 'react'

import { isProdLike } from '@cowprotocol/common-utils'

import { reduceRemoveCode, reduceSetSavedCode } from './referralReducers'

import { REFERRAL_STORAGE_KEY } from '../../config/constants'
import { sanitizeReferralCode } from '../../lib/code'
import { ReferralDomainState } from '../types'

type SetReferralState = Dispatch<SetStateAction<ReferralDomainState>>
type SetHydratedState = Dispatch<SetStateAction<boolean>>

export function useReferralHydration(setState: SetReferralState, setHydrated: SetHydratedState): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      setHydrated(true)
      return
    }

    let shouldHydrate = true

    try {
      const stored = window.localStorage.getItem(REFERRAL_STORAGE_KEY)

      if (stored) {
        const sanitized = sanitizeReferralCode(stored)

        if (sanitized) {
          setState((prev) => reduceSetSavedCode(prev, sanitized))
        }
      }
    } catch (error) {
      shouldHydrate = true
      if (!isProdLike) {
        console.warn('[Referral] Failed to read saved code from storage', error)
      }
    }

    if (shouldHydrate) {
      setHydrated(true)
    }
  }, [setHydrated, setState])
}

export function useReferralPersistence(savedCode: string | undefined, hasHydrated: boolean): void {
  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') {
      return
    }

    try {
      if (!savedCode) {
        window.localStorage.removeItem(REFERRAL_STORAGE_KEY)
      } else {
        window.localStorage.setItem(REFERRAL_STORAGE_KEY, savedCode)
      }
    } catch (error) {
      if (!isProdLike) {
        console.warn('[Referral] Failed to persist saved code', error)
      }
    }
  }, [hasHydrated, savedCode])
}

export function useReferralStorageSync(setState: SetReferralState): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const applyValue = (value: string | null): void => {
      setState((prev) => {
        const sanitized = value ? sanitizeReferralCode(value) : undefined

        if (!sanitized) {
          return prev.savedCode ? reduceRemoveCode(prev) : prev
        }

        if (prev.savedCode === sanitized) {
          return prev
        }

        return reduceSetSavedCode(prev, sanitized)
      })
    }

    const handleStorage = (event: StorageEvent): void => {
      if (event.key !== REFERRAL_STORAGE_KEY) {
        return
      }

      applyValue(event.newValue)
    }

    const handleFocus = (): void => {
      try {
        const current = window.localStorage.getItem(REFERRAL_STORAGE_KEY)
        applyValue(current)
      } catch (error) {
        if (!isProdLike) {
          console.warn('[Referral] Failed to sync saved code from storage on focus', error)
        }
      }
    }

    const handleVisibility = (): void => {
      if (document.visibilityState === 'visible') {
        handleFocus()
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    handleFocus()

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [setState])
}
