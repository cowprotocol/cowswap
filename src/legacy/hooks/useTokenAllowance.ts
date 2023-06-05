import { useMemo } from 'react'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSingleCallResult } from 'lib/hooks/multicall'

import { useTokenContract } from './useContract'

export function useTokenAllowance(
  token: Nullish<Token>,
  owner?: string,
  spender?: string
): CurrencyAmount<Token> | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
