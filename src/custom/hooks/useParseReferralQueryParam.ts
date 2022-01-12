import { useMemo } from 'react'
import { isAddress } from '@ethersproject/address'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { REFERRAL_QUERY_PARAM } from 'hooks/useReferralLink'

type ReferralQueryValue = {
  value: string
  isValid: boolean
} | null

/**
 * Returns the parsed referral address from the query parameters if its a valid address
 */
export default function useParseReferralQueryParam(): ReferralQueryValue {
  const parsedQs = useParsedQueryString()

  const referral = useMemo(() => {
    const referralAddress = parsedQs[REFERRAL_QUERY_PARAM]
    if (typeof referralAddress === 'string' && isAddress(referralAddress)) {
      return { value: referralAddress, isValid: true }
    }

    if (referralAddress) {
      console.warn('Invalid referral address')
      return { value: '', isValid: false }
    }

    return null
  }, [parsedQs])

  return referral
}
