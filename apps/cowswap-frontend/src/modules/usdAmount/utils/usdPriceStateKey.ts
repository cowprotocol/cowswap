import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { UsdPriceStateKey } from '../types'

export function getUsdPriceStateKey(token: Token): UsdPriceStateKey {
  return `${getAddressKey(token.address)}|${token.chainId}`
}
