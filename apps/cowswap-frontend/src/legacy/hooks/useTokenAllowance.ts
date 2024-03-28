import { useMemo } from 'react'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR from 'swr'
import { Nullish } from 'types'

import { useTokenContract } from 'common/hooks/useContract'

const ALLOWANCES_SWR_CONFIG = { refreshInterval: ms`10s` }

/**
 * @deprecated use useTokensAllowances() hook instead
 */
export function useTokenAllowance(
  token: Nullish<Token>,
  owner?: string,
  spender?: string
): CurrencyAmount<Token> | undefined {
  const tokenAddress = token?.address
  const contract = useTokenContract(tokenAddress, false)

  const { data: allowance } = useSWR(
    ['useTokenAllowance', tokenAddress, owner, spender],
    async () => {
      if (!owner || !spender) return undefined

      return contract?.callStatic.allowance(owner, spender)
    },
    ALLOWANCES_SWR_CONFIG
  )

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
