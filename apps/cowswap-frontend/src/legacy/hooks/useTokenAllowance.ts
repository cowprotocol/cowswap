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
  spender?: string,
): CurrencyAmount<Token> | undefined {
  const tokenAddress = token?.address
  const { contract: tokenContract } = useTokenContract(tokenAddress, false)

  const { data: allowance } = useSWR(
    owner && spender && tokenContract ? ['useTokenAllowance', tokenAddress, owner, spender, tokenContract] : null,
    async ([, , _owner, _spender, _contract]) => _contract?.callStatic.allowance(_owner, _spender),
    ALLOWANCES_SWR_CONFIG,
  )

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance],
  )
}
