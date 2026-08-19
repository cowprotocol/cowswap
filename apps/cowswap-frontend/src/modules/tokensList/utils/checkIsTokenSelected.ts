import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import { Nullish } from 'types'

export function checkIsTokenSelected(token: TokenWithLogo, selectedToken: Nullish<Currency>): boolean {
  if (!selectedToken) return false
  return areAddressesEqual(token.address, getCurrencyAddress(selectedToken)) && token.chainId === selectedToken.chainId
}
