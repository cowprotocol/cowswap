import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { useTokensBalances } from './useTokensBalances'

export function useCurrencyAmountBalance(
  token: TokenWithLogo | undefined | null,
): CurrencyAmount<TokenWithLogo> | undefined {
  const { values: balances } = useTokensBalances()

  return useMemo(() => {
    if (!token) return undefined

    const balance = balances[getAddressKey(token.address)]

    if (!balance) return undefined

    return CurrencyAmount.fromRawAmount(token, balance.toHexString())
  }, [token, balances])
}
