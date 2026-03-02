import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Token } from '@uniswap/sdk-core'

import { optimisticAllowancesAtom } from 'entities/optimisticAllowance/optimisticAllowancesAtom'
import ms from 'ms.macro'
import { erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'

import { getOptimisticAllowanceKey } from '../../entities/optimisticAllowance/getOptimisticAllowanceKey'

const OPTIMISTIC_ALLOWANCE_TTL = ms`30s`

export function useTokenAllowance(token: Token | undefined, owner?: string, spender?: string): bigint | undefined {
  const tokenAddress = token?.address

  const { chainId, account } = useWalletInfo()
  const tradeSpender = useTradeSpenderAddress()
  const [optimisticAllowances, setOptimisticAllowances] = useAtom(optimisticAllowancesAtom)

  const targetOwner = owner ?? account
  const targetSpender = spender ?? tradeSpender

  const optimisticAllowanceKey = useMemo(() => {
    if (!tokenAddress || !targetOwner || !targetSpender) return null
    return getOptimisticAllowanceKey({ chainId, tokenAddress, owner: targetOwner, spender: targetSpender })
  }, [chainId, tokenAddress, targetOwner, targetSpender])

  const optimisticAllowance = optimisticAllowanceKey ? optimisticAllowances[optimisticAllowanceKey] : undefined

  const response = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'allowance',
    args: [targetOwner!, targetSpender!],
    query: { enabled: !!tokenAddress && !!targetOwner && !!targetSpender },
  })

  // Reset state on network changes
  useEffect(() => {
    setOptimisticAllowances({})
  }, [chainId, setOptimisticAllowances])

  // Clean up expired optimistic allowances
  useEffect(() => {
    const now = Date.now()
    const expiredKeys = Object.keys(optimisticAllowances).filter(
      (key) => now - optimisticAllowances[key].timestamp > OPTIMISTIC_ALLOWANCE_TTL,
    )

    if (expiredKeys.length > 0) {
      setOptimisticAllowances((state) => {
        const newState = { ...state }
        expiredKeys.forEach((key) => delete newState[key])
        return newState
      })
    }
  }, [optimisticAllowances, setOptimisticAllowances, response.data])

  return optimisticAllowance?.amount ?? response.data
}
