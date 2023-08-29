import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { USDC } from 'legacy/constants/tokens'

import { getCowProtocolNativePrice } from './getCowProtocolNativePrice'

export async function getCowProtocolUsdPrice(
  currency: Token,
  getUsdcPrice: () => Promise<number | null>
): Promise<number | null> {
  const usdcToken = USDC[currency.chainId as SupportedChainId]
  const usdNativePrice = await getUsdcPrice()
  const tokenNativePrice = await getCowProtocolNativePrice(currency)

  if (usdNativePrice && tokenNativePrice) {
    const usdPrice = invertNativeToTokenPrice(usdNativePrice, usdcToken.decimals)
    const tokenPrice = invertNativeToTokenPrice(tokenNativePrice, currency.decimals)

    if (tokenPrice === 0) return null

    return usdPrice / tokenPrice
  }

  return null
}

/**
 * API response value represents the amount of native token atoms needed to buy 1 atom of the specified token
 * This function inverts the price to represent the amount of specified token atoms needed to buy 1 atom of the native token
 */
function invertNativeToTokenPrice(value: number, decimals: number): number {
  return (1 / value) * 10 ** (18 - decimals)
}
