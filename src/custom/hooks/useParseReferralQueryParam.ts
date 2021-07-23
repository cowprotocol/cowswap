import { useMemo } from 'react'
import { isAddress } from 'ethers/lib/utils'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { REFERRAL_QUERY_PARAM } from 'hooks/useReferralLink'

/**
 * Returns the parsed referral address from the query parameters if its a valid address
 */
export default function useParseReferralQueryParam(): string | null {
  const parsedQs = useParsedQueryString()

  const referral = useMemo(() => {
    const referralAddress = parsedQs[REFERRAL_QUERY_PARAM]
    if (typeof referralAddress === 'string' && isAddress(referralAddress)) {
      return referralAddress
    }

    if (referralAddress) {
      console.warn('Invalid referral address')
    }

    return null
  }, [parsedQs])

  return referral
}
