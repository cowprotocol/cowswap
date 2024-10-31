import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'

export function tokensListSorter(balances: BalancesState['values']): (a: TokenWithLogo, b: TokenWithLogo) => number {
  return (a: TokenWithLogo, b: TokenWithLogo) => {
    const aBalance = balances[a.address.toLowerCase()]
    const bBalance = balances[b.address.toLowerCase()]
    const aIsNative = getIsNativeToken(a)
    const bIsNative = getIsNativeToken(b)

    // Native always first
    if (aIsNative || bIsNative) {
      return aIsNative ? -1 : 1
    }

    if (aBalance && bBalance) {
      return +bBalance.sub(aBalance)
    }

    if (aBalance && !bBalance) {
      return -1
    }

    return 0
  }
}
