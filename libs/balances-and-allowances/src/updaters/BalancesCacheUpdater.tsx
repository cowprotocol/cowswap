import { useAtom } from 'jotai/index'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import { balancesAtom, balancesCacheAtom } from '../state/balancesAtom'

interface BalancesCacheUpdaterProps {
  chainId: SupportedChainId
  account: string | undefined
  excludedTokens: Set<string>
}

export function BalancesCacheUpdater({ chainId, account, excludedTokens }: BalancesCacheUpdaterProps): null {
  const [balances, setBalances] = useAtom(balancesAtom)
  const [balancesCache, setBalancesCache] = useAtom(balancesCacheAtom)
  const lastChainCacheUpdateRef = useRef<SupportedChainId | null>(null)

  // Persist into localStorage only non-zero balances
  useEffect(() => {
    if (!account || balances.chainId !== chainId) return

    setBalancesCache((state) => {
      const balancesValues = balances.values

      const balancesToCache = Object.keys(balancesValues).reduce(
        (acc, tokenAddress) => {
          const balance = balancesValues[tokenAddress]

          if (balance && !balance.isZero()) {
            acc[tokenAddress] = balance.toString()
          }

          return acc
        },
        {} as Record<string, string>,
      )

      const currentCache = state[chainId]?.[account.toLowerCase()] || {}
      // Remove zero balances from the current cache
      const updatedCache = Object.keys(currentCache).reduce(
        (acc, tokenAddress) => {
          if (!balancesValues[tokenAddress]?.isZero()) {
            acc[tokenAddress] = currentCache[tokenAddress]
          }

          return acc
        },
        {} as Record<string, string>,
      )

      return {
        ...state,
        [chainId]: {
          ...state[chainId],
          [account.toLowerCase()]: {
            ...updatedCache,
            ...balancesToCache,
          },
        },
      }
    })
  }, [chainId, account, balances.values, balances.chainId, setBalancesCache])

  // Restore balances from cache once
  useLayoutEffect(() => {
    if (!account) return
    if (lastChainCacheUpdateRef.current === chainId) return

    const cache = balancesCache[chainId]?.[account.toLowerCase()]

    if (!cache) return

    const cacheKeys = Object.keys(cache)

    if (cacheKeys.length === 0) return

    lastChainCacheUpdateRef.current = chainId

    setBalances((state) => {
      return {
        fromCache: true,
        chainId,
        isLoading: state.isLoading,
        hasFirstLoad: state.hasFirstLoad,
        error: state.error,
        values: {
          ...state.values,
          ...cacheKeys.reduce(
            (acc, tokenAddress) => {
              // Do not override excludedTokens with cache
              if (!excludedTokens.has(tokenAddress)) {
                acc[tokenAddress] = BigNumber.from(cache[tokenAddress])
              }

              return acc
            },
            {} as Record<string, BigNumber>,
          ),
        },
      }
    })

    return
  }, [balancesCache, chainId, account, excludedTokens, setBalances])

  return null
}
