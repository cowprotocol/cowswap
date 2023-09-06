import { Token } from '@uniswap/sdk-core'

import { getNativePrice } from 'api/gnosisProtocol'

export async function getCowProtocolNativePrice(currency: Token): Promise<number | null> {
  const response = await getNativePrice(currency.chainId, currency.address)

  if (typeof response.price !== 'number') {
    return null
  }

  return response.price
}
