import { useMemo } from 'react'
import { CurrencyAmount, NativeCurrency, Token } from '@uniswap/sdk-core'

/**
 * UseMemo effectively (by values) compare only primitive types and compare objects by links
 * To get the best performance we need process objects changes manually
 */
export function useSafeMemo<T>(deps: unknown[] | null, memoCall: () => T): T {
  const safeDeps = deps
    ? deps.map((dep) => {
        if (dep instanceof NativeCurrency) return dep.symbol
        if (dep instanceof Token) return dep.address.toLowerCase()
        if (dep instanceof CurrencyAmount) return dep.toExact()

        return dep
      })
    : [deps]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(memoCall, safeDeps)
}

export function useSafeMemoObject<T extends { [key: string]: unknown } | null>(depsObj: T): typeof depsObj {
  return useSafeMemo<typeof depsObj>(depsObj ? Object.values(depsObj) : null, () => depsObj)
}
