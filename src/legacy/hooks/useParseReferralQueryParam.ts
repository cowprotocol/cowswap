import { useMemo, useState } from 'react'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { REFERRAL_QUERY_PARAM } from 'hooks/useReferralLink'
import useENS from 'hooks/useENS'
import { isAddress } from 'utils'

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
  const [loading, setLoading] = useState(isAddress(referralAddress) === false) // this is a hack to force a initial loading state to true in case of referralAddress is a ens name because the useENS hook returns loading as false when initialized

  return useMemo(() => {
    if (loading || result.loading || !referralAddress) {
      if (result.loading) {
        setLoading(false)
      }
      return null
    }

    if (result.address) {
      return { value: result.address, isValid: true }
    }

    console.warn('Invalid referral address')
    return { value: '', isValid: false }
  }, [result.loading, result.address, referralAddress, loading])
}
