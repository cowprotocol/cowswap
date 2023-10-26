import { TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'

import { TokenAmounts } from 'modules/tokens'

export function tokensListSorter(balances: TokenAmounts): (a: TokenWithLogo, b: TokenWithLogo) => number {
  return (a: TokenWithLogo, b: TokenWithLogo) => {
    const aBalance = balances[a.address]
    const bBalance = balances[b.address]
    const aIsNative = getIsNativeToken(a)
    const bIsNative = getIsNativeToken(b)

    // Native always first
    if (aIsNative || bIsNative) {
      return aIsNative ? -1 : 1
    }

    if (aBalance?.value && bBalance?.value) {
      return +bBalance.value.toExact() - +aBalance.value.toExact()
    }

    return 0
  }
}
