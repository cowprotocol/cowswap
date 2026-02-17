import { useEffect, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import { VERIFICATION_DEBOUNCE_MS } from 'modules/affiliate/config/affiliateProgram.const'
import { formatRefCode } from 'modules/affiliate/lib/affiliateProgramUtils'

export type PartnerCodeAvailabilityState = 'idle' | 'invalid' | 'checking' | 'available' | 'unavailable' | 'error'

interface UseAffiliatePartnerCodeAvailabilityParams {
  inputCode: string
  canVerify: boolean
}

interface UseAffiliatePartnerCodeAvailabilityResult {
  normalizedCode: string
  isCodeValid: boolean
  availability: PartnerCodeAvailabilityState
  availabilityErrorMessage: string | null
}

export function useAffiliatePartnerCodeAvailability({
  inputCode,
  canVerify,
}: UseAffiliatePartnerCodeAvailabilityParams): UseAffiliatePartnerCodeAvailabilityResult {
  const [availability, setAvailability] = useState<PartnerCodeAvailabilityState>('idle')
  const [availabilityErrorMessage, setAvailabilityErrorMessage] = useState<string | null>(null)

  const normalizedCode = useMemo(() => formatRefCode(inputCode) ?? '', [inputCode])
  const isCodeValid = Boolean(normalizedCode)

  useEffect(() => {
    if (!canVerify) {
      setAvailability('idle')
      setAvailabilityErrorMessage(null)
      return
    }

    if (!inputCode) {
      setAvailability('idle')
      setAvailabilityErrorMessage(null)
      return
    }

    if (!isCodeValid) {
      setAvailability('invalid')
      setAvailabilityErrorMessage(null)
      return
    }

    let active = true
    setAvailability('checking')
    setAvailabilityErrorMessage(null)

    const timer = setTimeout(() => {
      bffAffiliateApi
        .verifyReferralCode({ code: normalizedCode })
        .then((response) => {
          if (!active) {
            return
          }

          if (response.ok || response.status === 403) {
            setAvailability('unavailable')
            return
          }

          if (response.status === 404) {
            setAvailability('available')
            return
          }

          setAvailability('error')
          setAvailabilityErrorMessage(t`Affiliate service is unreachable. Try again later.`)
        })
        .catch(() => {
          if (!active) {
            return
          }

          setAvailability('error')
          setAvailabilityErrorMessage(t`Affiliate service is unreachable. Try again later.`)
        })
    }, VERIFICATION_DEBOUNCE_MS)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [canVerify, inputCode, isCodeValid, normalizedCode])

  return {
    normalizedCode,
    isCodeValid,
    availability,
    availabilityErrorMessage,
  }
}
