import { USDC } from '@cowprotocol/common-const'
import { FractionUtils } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction, Token } from '@uniswap/sdk-core'

import { getCowProtocolNativePrice } from './getCowProtocolNativePrice'

export async function getCowProtocolUsdPrice(currency: Token): Promise<Fraction | null> {
  const usdcToken = USDC[currency.chainId as SupportedChainId]
  const usdNativePrice = await getCowProtocolNativePrice(usdcToken)
  const tokenNativePrice = await getCowProtocolNativePrice(currency)

  if (usdNativePrice && tokenNativePrice) {
    const usdPrice = invertNativeToTokenPrice(usdNativePrice, usdcToken.decimals)
    const tokenPrice = invertNativeToTokenPrice(tokenNativePrice, currency.decimals)

    if (tokenPrice.equalTo(0)) return null

    return usdPrice.divide(tokenPrice)
  }

  return null
}

/**
 * API response value represents the amount of native token atoms needed to buy 1 atom of the specified token
 * This function inverts the price to represent the amount of specified token atoms needed to buy 1 atom of the native token
 */
function invertNativeToTokenPrice(value: number | Fraction, decimals: number): Fraction {
  const v = value instanceof Fraction ? value : FractionUtils.fromNumber(value)
  const inverted = new Fraction(1).divide(v)
  return inverted.multiply(new Fraction(10 ** (18 - decimals), 1))
}
