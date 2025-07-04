import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { useTokensByAddressMap } from '@cowprotocol/tokens'

import { useParams } from 'react-router'

export interface TokenToRefund {
  token: TokenWithLogo
  balance: bigint
}

export function useTokensToRefund(): TokenToRefund[] | undefined {
  const params = useParams()
  const tokensByAddress = useTokensByAddressMap()
  const balances = useTokensBalances()

  const tokenAddressFromUrl = params.token

  return useMemo(() => {
    const tokenFromUrl = !!tokenAddressFromUrl && tokensByAddress[tokenAddressFromUrl.toLowerCase()]

    /**
     * Token from URL takes priority
     */
    if (tokenFromUrl) {
      return [
        {
          token: tokenFromUrl,
          balance: balances.values[tokenFromUrl.address.toLowerCase()]?.toBigInt() || 0n,
        },
      ]
    }

    return Object.keys(balances.values)
      .reduce<TokenToRefund[]>((acc, tokenAddress) => {
        const token = tokensByAddress[tokenAddress.toLowerCase()]
        const balance = balances.values[tokenAddress]?.toBigInt()

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

        return b.balance > a.balance ? 1 : -1
      })
  }, [tokenAddressFromUrl, balances.values, tokensByAddress])
}
