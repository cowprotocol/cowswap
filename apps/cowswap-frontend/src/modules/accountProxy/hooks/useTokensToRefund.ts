import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenAddressKey } from '@cowprotocol/common-utils'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { BigNumber } from '@ethersproject/bignumber'

export interface TokenToRefund {
  token: TokenWithLogo
  balance: BigNumber
}

export function useTokensToRefund(): TokenToRefund[] | undefined {
  const tokensByAddress = useTokensByAddressMap()
  const balances = useTokensBalances()

  return useMemo(() => {
    return Object.keys(balances.values)
      .reduce<TokenToRefund[]>((acc, tokenAddress) => {
        const token = tokensByAddress[getTokenAddressKey(tokenAddress)]
        const balance = balances.values[tokenAddress]

        if (token && balance?.gt(0)) {
          acc.push({
            balance,
            token,
          })
        }

        return acc
      }, [])
      .sort((a, b) => {
        if (a.balance.eq(b.balance)) return 0

        return b.balance.gt(a.balance) ? 1 : -1
      })
  }, [balances.values, tokensByAddress])
}
