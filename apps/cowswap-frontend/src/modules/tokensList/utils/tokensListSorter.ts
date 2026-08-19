import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'

export function tokensListSorter(
  balances: BalancesState['values'],
  symbolsWithCrossChainBalance?: ReadonlySet<string>,
): (a: TokenWithLogo, b: TokenWithLogo) => number {
  return (a: TokenWithLogo, b: TokenWithLogo) => {
    const aIsNative = getIsNativeToken(a)
    const bIsNative = getIsNativeToken(b)

    // Native always first
    if (aIsNative || bIsNative) {
      return aIsNative ? -1 : 1
    }

    const aBalance = balances[getAddressKey(a.address)]
    const bBalance = balances[getAddressKey(b.address)]
    const byBalance = compareByBalance(aBalance, bBalance)
    if (byBalance !== 0) return byBalance

    // Neither has a balance on the currently browsed chain — fall back to
    // whether the symbol has a balance on some other chain.
    return compareByCrossChainBalance(a, b, symbolsWithCrossChainBalance)
  }
}

function compareByBalance(aBalance: bigint | undefined, bBalance: bigint | undefined): number {
  if (aBalance && bBalance) {
    if (aBalance === bBalance) return 0
    return aBalance > bBalance ? -1 : 1
  }
  if (aBalance && !bBalance) return -1
  if (!aBalance && bBalance) return 1
  return 0
}

function compareByCrossChainBalance(
  a: TokenWithLogo,
  b: TokenWithLogo,
  symbolsWithCrossChainBalance?: ReadonlySet<string>,
): number {
  const aHasCrossChainBalance = hasCrossChainBalance(a, symbolsWithCrossChainBalance)
  const bHasCrossChainBalance = hasCrossChainBalance(b, symbolsWithCrossChainBalance)
  if (aHasCrossChainBalance && !bHasCrossChainBalance) return -1
  if (!aHasCrossChainBalance && bHasCrossChainBalance) return 1
  return 0
}

function hasCrossChainBalance(token: TokenWithLogo, symbolsWithCrossChainBalance?: ReadonlySet<string>): boolean {
  return !!token.symbol && !!symbolsWithCrossChainBalance?.has(token.symbol.toUpperCase())
}
