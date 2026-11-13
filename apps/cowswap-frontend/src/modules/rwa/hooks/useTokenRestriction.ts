import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import ms from 'ms.macro'
import useSWR from 'swr'

import { fetchTokenRestriction, TokenRestriction } from '../api/fetchTokenRestriction'

const TOKEN_RESTRICTION_SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: ms`5m`,
}

/**
 * Whether `token` is restricted in `country`, according to the BFF.
 * `undefined` while the answer is not known: no country, a request in flight, or a failed request.
 */
export function useTokenRestriction(
  token: Token | undefined,
  country: string | null,
  isEnabled: boolean,
): TokenRestriction | undefined {
  const { data } = useSWR(
    isEnabled && token && country
      ? ['useTokenRestriction', token.chainId, getAddressKey(token.address), country.toUpperCase()]
      : null,
    ([, chainId, addressKey, countryCode]) => fetchTokenRestriction(chainId, addressKey, countryCode),
    TOKEN_RESTRICTION_SWR_OPTIONS,
  )

  return data
}
