import { useEffect, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'

import useSWR from 'swr'

import { AffiliatePartnerCodeAvailabilityResult } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { VERIFICATION_DEBOUNCE_MS } from '../config/affiliateProgram.const'
import { AffiliatePartnerCodeCreateError } from '../lib/affiliatePartnerCodeCreateError'

export enum PartnerCodeAvailability {
  Idle = 'idle',
  Checking = 'checking',
  Available = 'available',
  Unavailable = 'unavailable',
  NetworkError = 'networkError',
}

export function useAffiliatePartnerCodeAvailability(
  refCode: string,
  enabled: boolean,
  setError: (error?: AffiliatePartnerCodeCreateError) => void,
): PartnerCodeAvailability {
  const analytics = useCowAnalytics()
  const [debouncedCode, setDebouncedCode] = useState<string>('')
  const lastTrackedResolutionKeyRef = useRef<string | undefined>(undefined)

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

  const {
    data: isAvailable,
    error,
    isLoading,
  } = useSWR<boolean>(
    !waitingForDebouncedInput && debouncedCode ? ['affiliate-partner-code-availability', debouncedCode] : null,
    async ([, code]) => bffAffiliateApi.verifyCodeAvailability(code as string),
    {
      ...SWR_NO_REFRESH_OPTIONS,
      shouldRetryOnError: false,
    },
  )

  useEffect(() => {
    if (error) {
      setError(AffiliatePartnerCodeCreateError.NetworkError)
    }
  }, [error, setError])

  const availability = getPartnerCodeAvailability({
    enabled,
    error,
    isAvailable,
    isLoading,
    refCode,
    waitingForDebouncedInput,
  })

  useEffect(() => {
    const result = AVAILABILITY_RESULT_MAP[availability]

    if (!result || !debouncedCode) {
      return
    }

    const resolutionKey = `${debouncedCode}:${result}`

    if (lastTrackedResolutionKeyRef.current === resolutionKey) {
      return
    }

    lastTrackedResolutionKeyRef.current = resolutionKey

    trackAffiliateEvent({
      analytics,
      action: 'affiliate_partner_code_availability_resolved',
      result,
      codeLength: debouncedCode.length,
    })
  }, [analytics, availability, debouncedCode])

  return availability
}

const AVAILABILITY_RESULT_MAP: Partial<Record<PartnerCodeAvailability, AffiliatePartnerCodeAvailabilityResult>> = {
  [PartnerCodeAvailability.Available]: AffiliatePartnerCodeAvailabilityResult.AVAILABLE,
  [PartnerCodeAvailability.Unavailable]: AffiliatePartnerCodeAvailabilityResult.UNAVAILABLE,
  [PartnerCodeAvailability.NetworkError]: AffiliatePartnerCodeAvailabilityResult.NETWORK_ERROR,
}

interface GetPartnerCodeAvailabilityParams {
  enabled: boolean
  error: unknown
  isAvailable: boolean | undefined
  isLoading: boolean
  refCode: string
  waitingForDebouncedInput: boolean
}

function getPartnerCodeAvailability({
  enabled,
  error,
  isAvailable,
  isLoading,
  refCode,
  waitingForDebouncedInput,
}: GetPartnerCodeAvailabilityParams): PartnerCodeAvailability {
  if (!enabled || !refCode) {
    return PartnerCodeAvailability.Idle
  }

  if (waitingForDebouncedInput || isLoading) {
    return PartnerCodeAvailability.Checking
  }

  if (error) {
    return PartnerCodeAvailability.NetworkError
  }

  if (isAvailable === true) {
    return PartnerCodeAvailability.Available
  }

  if (isAvailable === false) {
    return PartnerCodeAvailability.Unavailable
  }

  return PartnerCodeAvailability.Checking
}
