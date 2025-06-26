import { useMemo } from 'react'

import { BalancesState, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { BigNumber } from '@ethersproject/bignumber'
import { Token } from '@uniswap/sdk-core'

const PRIORITISED_TOKENS = ['COW', 'GNO']

// compare two token amounts with highest one coming first
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function balanceComparator(balanceA: BigNumber | undefined, balanceB: BigNumber | undefined) {
  if (balanceA && balanceB) {
    return balanceA.gt(balanceB) ? -1 : balanceA.eq(balanceB) ? 0 : 1
  } else if (balanceA && balanceA.gt('0')) {
    return -1
  } else if (balanceB && balanceB.gt('0')) {
    return 1
  }
  return 0
}

function getTokenComparator(balances: BalancesState['values']): (tokenA: Token, tokenB: Token) => number {
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  return function sortTokens(tokenA: Token, tokenB: Token): number {
    // -1 = a is first
    // 1 = b is first

    // sort by balances
    const balanceA = balances[tokenA.address.toLowerCase()]
    const balanceB = balances[tokenB.address.toLowerCase()]

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
  const { values: balances } = useTokensBalances()

  const comparator = useMemo(() => getTokenComparator(balances), [balances])

  return useMemo(() => {
    if (inverted) {
      return (tokenA: Token, tokenB: Token) => comparator(tokenA, tokenB) * -1
    } else {
      return comparator
    }
  }, [inverted, comparator])
}
