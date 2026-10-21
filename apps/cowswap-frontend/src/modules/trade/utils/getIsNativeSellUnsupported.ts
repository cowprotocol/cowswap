import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import { TradeType } from 'common/modules/tradeNavigation'

/**
 * Selling a native token is only supported in Swap. Every other trade type wraps at order creation
 * instead of at execution, so the balance would move before the order can fill, and cancelling does
 * not bring it back.
 */
export function getIsNativeSellUnsupported(inputCurrency: Nullish<Currency>, tradeType: Nullish<TradeType>): boolean {
  return !!inputCurrency && getIsNativeToken(inputCurrency) && tradeType !== TradeType.SWAP
}
