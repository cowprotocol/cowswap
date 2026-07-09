import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'

export interface TokenToRefund {
  token: TokenWithLogo
  balance: bigint
}

export function useTokensToRefund(): TokenToRefund[] | undefined {
  const tokensByAddress = useTokensByAddressMap()
  const balances = useTokensBalances()

  return useMemo(() => {
    return Object.keys(balances.values)
      .reduce<TokenToRefund[]>((acc, tokenAddress) => {
        const token = tokensByAddress[getAddressKey(tokenAddress)]
        const balance = balances.values[tokenAddress]

        if (token && balance && balance > 0n) {
          acc.push({
            balance,
            token,
          })
        }

        return acc
      }, [])
      .sort((a, b) => {
        if (a.balance === b.balance) return 0

        return a.balance > b.balance ? -1 : 1
      })
  }, [balances.values, tokensByAddress])
}
