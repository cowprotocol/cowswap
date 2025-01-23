import { EffectCallback, useEffect, useMemo } from 'react'

import { CurrencyAmount, NativeCurrency, Percent, Price, Token } from '@uniswap/sdk-core'

export function useSafeDeps(deps: unknown[]): unknown[] {
  return deps.map((dep) => {
    if (dep instanceof NativeCurrency) return (dep.symbol || '') + dep.chainId
    if (dep instanceof Token) return dep.address.toLowerCase() + dep.chainId
    if (dep instanceof CurrencyAmount) return dep.toExact() + dep.currency.symbol + dep.currency.chainId
    if (dep instanceof Percent) return dep.toFixed(6)
    if (dep instanceof Price)
      return (
        dep.numerator.toString() +
        dep.denominator.toString() +
        dep.baseCurrency.symbol +
        dep.quoteCurrency.symbol +
        dep.baseCurrency.chainId +
        dep.quoteCurrency.chainId
      )

    return dep
  })
}

/**
 * UseMemo effectively (by values) compare only primitive types and compare objects by links
 * To get the best performance we need process objects changes manually
 */
export function useSafeMemo<T>(memoCall: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(memoCall, useSafeDeps(deps))
}

export function useSafeMemoObject<T extends { [key: string]: unknown }>(depsObj: T): typeof depsObj {
  return useSafeMemo<typeof depsObj>(() => depsObj, Object.values(depsObj))
}

export function useSafeEffect(memoCall: EffectCallback, deps: unknown[]): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(memoCall, useSafeDeps(deps))
}
