import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { useTradeSpenderAddress } from './useTradeSpenderAddress'

export type AllowancesState = Record<string, bigint | undefined>

export function useTokenAllowances(tokenAddresses: string[]): {
  state: AllowancesState | undefined
  isLoading: boolean
} {
  const { chainId, account } = useWalletInfo()

  const spender = useTradeSpenderAddress()

  const { data: allowances, isLoading } = useReadContracts({
    contracts: tokenAddresses.map((address) => ({
      abi: erc20Abi,
      address: address as `0x${string}`,
      chainId,
      functionName: 'allowance',
      args: [account as `0x${string}`, spender as `0x${string}`],
    })),
    query: {
      enabled: !!account && !!spender && tokenAddresses.length > 0,
      refetchInterval: ms`32s`,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  })

  const state = useMemo(() => {
    if (!allowances?.length) return

    return tokenAddresses.reduce<AllowancesState>((acc, address, index) => {
      const result = allowances[index]?.result
      acc[address.toLowerCase()] = result !== undefined ? (result as bigint) : undefined
      return acc
    }, {})
  }, [tokenAddresses, allowances])

  return useMemo(() => ({ state, isLoading }), [state, isLoading])
}
