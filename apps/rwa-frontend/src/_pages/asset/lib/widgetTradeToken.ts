import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import type { OnTradeParamsPayload } from '@cowprotocol/events'

import type { RwaQuoteSide, RwaToken } from '@/entities/asset'

/** The asset token traded in the widget: the buy token on the buy side, the sell token on the sell side */
export function findWidgetTradeToken(
  { sellToken, buyToken }: Pick<OnTradeParamsPayload, 'sellToken' | 'buyToken'>,
  side: RwaQuoteSide,
  assetTokens: RwaToken[],
): RwaToken | undefined {
  const widgetToken = side === 'buy' ? buyToken : sellToken

  if (!widgetToken) return undefined

  return assetTokens.find(
    (token) => token.chainId === widgetToken.chainId && areAddressesEqual(token.address, widgetToken.address),
  )
}
