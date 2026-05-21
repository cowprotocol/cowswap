import { useMemo } from 'react'

import { toHex } from 'viem'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/currency'

import { useTokensBalances } from './useTokensBalances'

export function useCurrencyAmountBalance(
  token: TokenWithLogo | undefined | null,
): CurrencyAmount<TokenWithLogo> | undefined {
  const { values: balances } = useTokensBalances()

  return useMemo(() => {
    if (!token) return undefined

    const balance = balances[token.address.toLowerCase()]

    if (!balance) return undefined

    return CurrencyAmount.fromRawAmount(token, toHex(balance))
  }, [token, balances])
}
