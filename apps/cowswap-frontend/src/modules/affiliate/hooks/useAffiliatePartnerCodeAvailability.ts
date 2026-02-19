import { useEffect, useState } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'

import useSWR from 'swr'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { VERIFICATION_DEBOUNCE_MS } from '../config/affiliateProgram.const'
import { type AffiliatePartnerCodeCreateError } from '../lib/affiliatePartnerCodeCreateError'

export enum PartnerCodeAvailability {
  Idle = 'idle',
  Checking = 'checking',
  Available = 'available',
  Unavailable = 'unavailable',
}

export function useAffiliatePartnerCodeAvailability(
  refCode: string,
  enabled: boolean,
  setError: (error?: AffiliatePartnerCodeCreateError) => void,
): PartnerCodeAvailability {
  const [debouncedCode, setDebouncedCode] = useState<string>('')

  useEffect(() => {
    if (!enabled) {
      setDebouncedCode('')
      return
    }

    const timer = setTimeout(() => {
      setDebouncedCode(refCode)
    }, VERIFICATION_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [refCode, enabled])

  const waitingForDebouncedInput = enabled && debouncedCode !== refCode

  const { data: isAvailable, isLoading } = useSWR<boolean>(
    !waitingForDebouncedInput && debouncedCode ? ['affiliate-partner-code-availability', debouncedCode] : null,
    async ([, code]) => {
      try {
        return await bffAffiliateApi.verifyReferralCodeAvailability(code as string)
      } catch {}

      setError({ code: 'networkError' })
      return false
    },
    {
      ...SWR_NO_REFRESH_OPTIONS,
      shouldRetryOnError: false,
    },
  )

  if (!enabled || !refCode) return PartnerCodeAvailability.Idle
  if (waitingForDebouncedInput || isLoading) return PartnerCodeAvailability.Checking
  if (isAvailable === true) return PartnerCodeAvailability.Available
  if (isAvailable === false) return PartnerCodeAvailability.Unavailable

  return PartnerCodeAvailability.Checking
}
