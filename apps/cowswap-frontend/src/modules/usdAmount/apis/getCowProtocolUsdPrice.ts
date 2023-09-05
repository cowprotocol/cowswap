import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { BigNumber } from 'bignumber.js'

import { LONG_PRECISION } from 'legacy/constants'
import { USDC } from 'legacy/constants/tokens'
import { ONE_BIG_NUMBER, TEN_BIG_NUMBER } from 'legacy/state/orders/priceUtils'

import { getCowProtocolNativePrice } from './getCowProtocolNativePrice'

export async function getCowProtocolUsdPrice(
  currency: Token,
  getUsdcPrice: () => Promise<string | null>
): Promise<string | null> {
  const usdcToken = USDC[currency.chainId as SupportedChainId]
  const usdNativePrice = await getUsdcPrice()
  const tokenNativePrice = await getCowProtocolNativePrice(currency)

  if (usdNativePrice && tokenNativePrice) {
    const usdPrice = invertNativeToTokenPrice(usdNativePrice, usdcToken.decimals)
    const tokenPrice = invertNativeToTokenPrice(tokenNativePrice, currency.decimals)

    if (tokenPrice.eq(0)) return null

    return usdPrice.dividedBy(tokenPrice).toFixed(LONG_PRECISION)
  }

  return null
}

/**
 * API response value represents the amount of native token atoms needed to buy 1 atom of the specified token
 * This function inverts the price to represent the amount of specified token atoms needed to buy 1 atom of the native token
 */
function invertNativeToTokenPrice(value: string, decimals: number): BigNumber {
  const v = new BigNumber(value)

  return ONE_BIG_NUMBER.dividedBy(v).times(TEN_BIG_NUMBER.exponentiatedBy(18 - decimals))
}
