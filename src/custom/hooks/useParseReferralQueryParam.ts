import { useMemo } from 'react'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { REFERRAL_QUERY_PARAM } from 'hooks/useReferralLink'
import useENS from 'hooks/useENS'

type ReferralQueryValue = {
  value: string
  isValid: boolean
} | null

/**
 * Returns the parsed referral address from the query parameters if its a valid address
 */
export default function useParseReferralQueryParam(): ReferralQueryValue {
  const parsedQs = useParsedQueryString()
  const referralAddress = parsedQs[REFERRAL_QUERY_PARAM] as string
  const result = useENS(referralAddress)

  const referral = useMemo(() => {
    if (result.loading || !referralAddress) {
      return null
    }

    if (result.address) {
      return { value: result.address, isValid: true }
    }

    console.warn('Invalid referral address')
    return { value: '', isValid: false }
  }, [result.loading, result.address, referralAddress])

  return referral
}
