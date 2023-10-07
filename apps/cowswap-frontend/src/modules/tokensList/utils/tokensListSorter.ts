import { NATIVE_CURRENCY_BUY_ADDRESS, TokenWithLogo } from '@cowprotocol/common-const'

import { TokenAmounts } from 'modules/tokens'

const nativeTokenAddress = NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase()

export function tokensListSorter(balances: TokenAmounts): (a: TokenWithLogo, b: TokenWithLogo) => number {
  return (a: TokenWithLogo, b: TokenWithLogo) => {
    const aBalance = balances[a.address]
    const bBalance = balances[b.address]

    // Native always first
    if (a.address.toLowerCase() === nativeTokenAddress || b.address.toLowerCase() === nativeTokenAddress) return 1

    if (aBalance?.value && bBalance?.value) {
      return +bBalance.value.toExact() - +aBalance.value.toExact()
    }

    return 0
  }
}
