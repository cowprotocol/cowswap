import { useMemo } from 'react'
import { CurrencyAmount, NativeCurrency, Token } from '@uniswap/sdk-core'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'

export function useSafeMemoDeps(deps: unknown[]): unknown[] {
  return deps.map((dep) => {
    if (dep instanceof NativeCurrency) return dep.symbol
    if (dep instanceof Token) return dep.address.toLowerCase()
    if (dep instanceof CurrencyAmount) return dep.toExact()
    if (dep instanceof WrappedTokenInfo) return dep.address

    return dep
  })
}

/**
 * UseMemo effectively (by values) compare only primitive types and compare objects by links
 * To get the best performance we need process objects changes manually
 */
export function useSafeMemo<T>(memoCall: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(memoCall, useSafeMemoDeps(deps))
}

export function useSafeMemoObject<T extends { [key: string]: unknown }>(depsObj: T): typeof depsObj {
  return useSafeMemo<typeof depsObj>(() => depsObj, Object.values(depsObj))
}
