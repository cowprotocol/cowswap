import { Token } from '@uniswap/sdk-core'

import { UsdPriceStateKey } from '../types'

export function getUsdPriceStateKey(token: Token): UsdPriceStateKey {
  return `${token.address.toLowerCase()}|${token.chainId}`
}
