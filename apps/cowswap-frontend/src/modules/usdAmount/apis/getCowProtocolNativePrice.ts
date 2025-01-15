import { FractionUtils } from '@cowprotocol/common-utils'
import { Fraction, Token } from '@uniswap/sdk-core'

import { getNativePrice } from 'api/cowProtocol'

export async function getCowProtocolNativePrice(currency: Token): Promise<Fraction | null> {
  const response = await getNativePrice(currency.chainId, currency.address)

  if (typeof response.price !== 'number') {
    return null
  }

  return FractionUtils.fromNumber(response.price)
}
