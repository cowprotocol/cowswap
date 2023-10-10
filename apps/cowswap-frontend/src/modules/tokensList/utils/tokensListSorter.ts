import { TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'

import { TokenAmounts } from 'modules/tokens'

export function tokensListSorter(balances: TokenAmounts): (a: TokenWithLogo, b: TokenWithLogo) => number {
  return (a: TokenWithLogo, b: TokenWithLogo) => {
    const aBalance = balances[a.address]
    const bBalance = balances[b.address]

    // Native always first
    if (getIsNativeToken(a) || getIsNativeToken(b)) return 1

    if (aBalance?.value && bBalance?.value) {
      return +bBalance.value.toExact() - +aBalance.value.toExact()
    }

    return 0
  }
}
