import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { toHex } from 'viem'

import { useTokensBalancesCombined } from './useTokensBalancesCombined'

export function useCurrencyAmountBalanceCombined(
  token: TokenWithLogo | undefined | null,
): CurrencyAmount<TokenWithLogo> | undefined {
  const { values: balances, chainId } = useTokensBalancesCombined()

  return useMemo(() => {
    if (!token) return undefined

    if (token.chainId !== chainId) return undefined

    const balance = balances[getAddressKey(token.address)]

    if (!balance && balance !== 0n) return undefined

    return CurrencyAmount.fromRawAmount(token, toHex(balance))
  }, [token, balances, chainId])
}
