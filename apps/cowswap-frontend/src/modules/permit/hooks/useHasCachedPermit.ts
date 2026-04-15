import { getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { PermitHookData } from '@cowprotocol/permit-utils'

import useSWR, { SWRResponse } from 'swr'

import { useGetCachedPermit } from './useGetCachedPermit'

export function useHasCachedPermit(amountToApprove: CurrencyAmount<Currency>): SWRResponse<PermitHookData | undefined> {
  const getCachedPermit = useGetCachedPermit()
  const token = getWrappedToken(amountToApprove.currency)
  const tokenAddress = token.address
  const amount = BigInt(amountToApprove.quotient.toString())

  return useSWR([tokenAddress, amount, token.chainId, 'useHasCachedPermit'], ([tokenAddress, amount]) => {
    return getCachedPermit(tokenAddress, amount)
  })
}
