import { Token } from '@cowprotocol/currency'

import { UsdPriceStateKey } from '../types'

export function getUsdPriceStateKey(token: Token): UsdPriceStateKey {
  return `${token.address.toLowerCase()}|${token.chainId}`
}
