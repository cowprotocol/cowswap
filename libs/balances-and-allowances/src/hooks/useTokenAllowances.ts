import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

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
      address,
      chainId,
      functionName: 'allowance',
      args: [account, spender],
    })),
  })

  const state = useMemo(() => {
    if (!allowances?.length) return

    return tokenAddresses.reduce<AllowancesState>((acc, address, index) => {
      acc[address.toLowerCase()] = BigInt(allowances[index].result || 0)
      return acc
    }, {})
  }, [tokenAddresses, allowances])

  return useMemo(() => ({ state, isLoading }), [state, isLoading])
}
