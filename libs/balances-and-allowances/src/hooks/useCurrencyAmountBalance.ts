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

    // A zero balance is a valid value, only a missing one means the balance is unknown
    if (balance === undefined || balance === null) return undefined

    return CurrencyAmount.fromRawAmount(token, toHex(balance))
  }, [token, balances])
}
