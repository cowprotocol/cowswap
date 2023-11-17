import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { TokenAmounts } from 'modules/tokens'

/**
 * Returns balances for all tokens + native token
 */
export function useAllTokensBalances(): [TokenAmounts, boolean] {
  const allTokensMap = useTokensByAddressMap()
  const { isLoading: balancesLoading, values: balancesRaw } = useTokensBalances()

  const balances = useMemo(() => {
    return Object.keys(balancesRaw).reduce<TokenAmounts>((acc, key) => {
      const token = allTokensMap[key]
      const balance = balancesRaw[key]

      if (token && balance) {
        acc[token.address] = {
          value: CurrencyAmount.fromRawAmount(token, balance.toString()),
          valid: true,
          loading: false,
          syncing: false,
          error: false,
        }
      }

      return acc
    }, {})
  }, [allTokensMap, balancesRaw])

  return [balances, balancesLoading]
}
