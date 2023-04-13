import { TokenAmounts } from '@cow/modules/tokens'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'

import { useAllTokenBalances } from 'state/connection/hooks'

const PRIORITISED_TOKENS = ['COW', 'GNO']

// compare two token amounts with highest one coming first
export function balanceComparator(balanceA?: CurrencyAmount<Currency>, balanceB?: CurrencyAmount<Currency>) {
  if (balanceA && balanceB) {
    return balanceA.greaterThan(balanceB) ? -1 : balanceA.equalTo(balanceB) ? 0 : 1
  } else if (balanceA && balanceA.greaterThan('0')) {
    return -1
  } else if (balanceB && balanceB.greaterThan('0')) {
    return 1
  }
  return 0
}

function getTokenComparator(balances: [TokenAmounts, boolean]): (tokenA: Token, tokenB: Token) => number {
  return function sortTokens(tokenA: Token, tokenB: Token): number {
    // -1 = a is first
    // 1 = b is first

    // sort by balances
    const balanceA = balances[0][tokenA.address]?.value
    const balanceB = balances[0][tokenB.address]?.value

    const balanceComp = balanceComparator(balanceA, balanceB)
    if (balanceComp !== 0) return balanceComp

    // Mod: modify tokens list by prioritised list
    const indexA = PRIORITISED_TOKENS.indexOf(tokenA.symbol || '')
    const indexB = PRIORITISED_TOKENS.indexOf(tokenB.symbol || '')

    if (indexA !== -1 && indexB !== -1) {
      return indexB < indexA ? 1 : -1
    } else if (indexA !== -1 || indexB !== -1) {
      return indexB !== -1 ? 1 : -1
    }

    if (tokenA.symbol && tokenB.symbol) {
      // sort by symbol
      return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1
    } else {
      return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0
    }
  }
}

export function useTokenComparator(inverted: boolean): (tokenA: Token, tokenB: Token) => number {
  const balances = useAllTokenBalances()
  const comparator = useMemo(() => getTokenComparator(balances ?? {}), [balances])
  return useMemo(() => {
    if (inverted) {
      return (tokenA: Token, tokenB: Token) => comparator(tokenA, tokenB) * -1
    } else {
      return comparator
    }
  }, [inverted, comparator])
}
