import { useMemo } from 'react'

import { useTokenContract } from '@cowprotocol/common-hooks'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import useSWR from 'swr'
import { Nullish } from 'types'

export function useTokenAllowance(
  token: Nullish<Token>,
  owner?: string,
  spender?: string
): CurrencyAmount<Token> | undefined {
  const tokenAddress = token?.address
  const contract = useTokenContract(tokenAddress, false)

  const { data: allowance } = useSWR(['useTokenAllowance', tokenAddress, owner, spender], async () => {
    if (!owner || !spender) return undefined

    return contract?.callStatic.allowance(owner, spender)
  })

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
