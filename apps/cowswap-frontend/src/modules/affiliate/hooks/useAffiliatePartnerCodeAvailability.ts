import { useEffect, useState } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'

import useSWR, { SWRConfiguration } from 'swr'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import { VERIFICATION_DEBOUNCE_MS } from 'modules/affiliate/config/affiliateProgram.const'
import { formatRefCode } from 'modules/affiliate/lib/affiliateProgramUtils'

export type PartnerCodeAvailabilityState = 'idle' | 'invalid' | 'checking' | 'available' | 'unavailable' | 'error'
type ResolvedPartnerCodeAvailabilityState = Exclude<PartnerCodeAvailabilityState, 'idle' | 'invalid' | 'checking'>

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

const SWR_OPTIONS: SWRConfiguration = {
  ...SWR_NO_REFRESH_OPTIONS,
  shouldRetryOnError: false,
}

const AVAILABILITY_ERROR_MESSAGE = 'Affiliate service is unreachable. Try again later.'
const AVAILABILITY_SWR_KEY = 'affiliate-partner-code-availability'

async function fetchCodeAvailability(code: string): Promise<ResolvedPartnerCodeAvailabilityState> {
  try {
    const response = await bffAffiliateApi.verifyReferralCode({ code })

    if (response.ok || response.status === 403) {
      return 'unavailable'
    }

    if (response.status === 404) {
      return 'available'
    }

    return 'error'
  } catch {
    return 'error'
  }
}

function getAvailabilityState(params: {
  canVerify: boolean
  inputCode: string
  isCodeValid: boolean
  waitingForDebouncedInput: boolean
  isLoading: boolean
  fetchedAvailability?: ResolvedPartnerCodeAvailabilityState
}): PartnerCodeAvailabilityState {
  const { canVerify, inputCode, isCodeValid, waitingForDebouncedInput, isLoading, fetchedAvailability } = params

  if (!canVerify || !inputCode) {
    return 'idle'
  }

  if (!isCodeValid) {
    return 'invalid'
  }

  if (waitingForDebouncedInput || isLoading) {
    return 'checking'
  }

  return fetchedAvailability ?? 'checking'
}

export function useAffiliatePartnerCodeAvailability({
  inputCode,
  canVerify,
}: UseAffiliatePartnerCodeAvailabilityParams): UseAffiliatePartnerCodeAvailabilityResult {
  const normalizedCode = formatRefCode(inputCode) ?? ''
  const isCodeValid = Boolean(normalizedCode)
  const [debouncedCode, setDebouncedCode] = useState<string>('')

  const shouldCheckAvailability = canVerify && Boolean(inputCode) && isCodeValid

  useEffect(() => {
    if (!shouldCheckAvailability) {
      setDebouncedCode('')
      return
    }

    const timer = setTimeout(() => {
      setDebouncedCode(normalizedCode)
    }, VERIFICATION_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [normalizedCode, shouldCheckAvailability])

  const waitingForDebouncedInput = shouldCheckAvailability && debouncedCode !== normalizedCode
  const swrKey = !waitingForDebouncedInput && debouncedCode ? ([AVAILABILITY_SWR_KEY, debouncedCode] as const) : null
  const { data: fetchedAvailability, isLoading } = useSWR<ResolvedPartnerCodeAvailabilityState>(
    swrKey,
    ([, code]) => fetchCodeAvailability(code as string),
    SWR_OPTIONS,
  )

  const availability = getAvailabilityState({
    canVerify,
    inputCode,
    isCodeValid,
    waitingForDebouncedInput,
    isLoading,
    fetchedAvailability,
  })
  const availabilityErrorMessage = availability === 'error' ? AVAILABILITY_ERROR_MESSAGE : null

  return {
    normalizedCode,
    isCodeValid,
    availability,
    availabilityErrorMessage,
  }
}
