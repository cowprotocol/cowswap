import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { useTokensByAddressMap } from '@cowprotocol/tokens'

import { useParams } from 'react-router'

interface BiggestBalanceState {
  balance: bigint
  tokenAddress: string | undefined
}

export interface DefaultTokenToRefund {
  token: TokenWithLogo
  balance: bigint
}

export function useDefaultTokenToRefund(isProxyDeployed: boolean): DefaultTokenToRefund | undefined {
  const params = useParams()
  const tokensByAddress = useTokensByAddressMap()
  const balances = useTokensBalances()

  const tokenAddressFromUrl = params.token

  return useMemo(() => {
    if (!isProxyDeployed) return undefined

    const tokenFromUrl = !!tokenAddressFromUrl && tokensByAddress[tokenAddressFromUrl.toLowerCase()]

    /**
     * Token from URL takes priority
     */
    if (tokenFromUrl) {
      return {
        token: tokenFromUrl,
        balance: balances.values[tokenFromUrl.address.toLowerCase()]?.toBigInt() || 0n,
      }
    }

    const biggestBalance = Object.keys(balances.values).reduce<BiggestBalanceState>(
      (state, tokenAddress) => {
        const balance = balances.values[tokenAddress]?.toBigInt()

        if (balance && balance > state.balance) {
          return {
            balance,
            tokenAddress,
          }
        }

        return state
      },
      { balance: 0n, tokenAddress: undefined },
    )

    /**
     * Take a token with the biggest balance
     */
    if (biggestBalance.balance > 0n && biggestBalance.tokenAddress) {
      const token = tokensByAddress[biggestBalance.tokenAddress.toLowerCase()]

      if (token) {
        return {
          token,
          balance: biggestBalance.balance,
        }
      }
    }

    return undefined
  }, [isProxyDeployed, tokenAddressFromUrl, balances.values, tokensByAddress])
}
