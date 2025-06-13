import { useAtom } from 'jotai/index'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'

import { balancesAtom, balancesCacheAtom } from '../state/balancesAtom'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function BalancesCacheUpdater({ chainId, account }: { chainId: SupportedChainId; account: string | undefined }) {
  const [balances, setBalances] = useAtom(balancesAtom)
  const [balancesCache, setBalancesCache] = useAtom(balancesCacheAtom)
  const areBalancesRestoredFromCacheRef = useRef(false)

  useEffect(() => {
    areBalancesRestoredFromCacheRef.current = false
  }, [chainId])

  // Persist into localStorage only non-zero balances
  useEffect(() => {
    if (!account) {
      return
    }

    if (balances.chainId !== chainId) return

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

      const currentCache = state[chainId] || {}
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
          ...updatedCache,
          ...balancesToCache,
        },
      }
    })
  }, [chainId, account, balances.values, balances.chainId, setBalancesCache])

  // Restore balances from cache once
  useLayoutEffect(() => {
    const cache = balancesCache[chainId]

    if (!account) return
    if (areBalancesRestoredFromCacheRef.current) return
    if (!cache) return

    const cacheKeys = Object.keys(cache)

    if (cacheKeys.length === 0) return

    areBalancesRestoredFromCacheRef.current = true

    setBalances((state) => {
      return {
        chainId,
        isLoading: state.isLoading,
        values: {
          ...state.values,
          ...cacheKeys.reduce(
            (acc, tokenAddress) => {
              acc[tokenAddress] = BigNumber.from(cache[tokenAddress])

              return acc
            },
            {} as Record<string, BigNumber>,
          ),
        },
      }
    })

    return
  }, [balancesCache, chainId, account, setBalances])

  return null
}
