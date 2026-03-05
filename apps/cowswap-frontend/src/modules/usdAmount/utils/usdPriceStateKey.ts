import { Token } from '@cowprotocol/common-entities'

import { UsdPriceStateKey } from '../types'

export function getUsdPriceStateKey(token: Token): UsdPriceStateKey {
  return `${token.address.toLowerCase()}|${token.chainId}`
}
