import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useTokensBalancesCombined } from './useTokensBalancesCombined'

export function useCurrencyAmountBalanceCombined(
  token: TokenWithLogo | undefined | null,
): CurrencyAmount<TokenWithLogo> | undefined {
  const { values: balances, chainId } = useTokensBalancesCombined()

  return useMemo(() => {
    if (!token) return undefined

    if (token.chainId !== chainId) return undefined

    const balance = balances[token.address.toLowerCase()]

    if (!balance) return undefined

    return CurrencyAmount.fromRawAmount(token, balance.toHexString())
  }, [token, balances, chainId])
}
