import { UiOrderType } from '@cowprotocol/types'

import { TradeTypeToUiOrderType } from 'modules/trade'

export function getUiOrderType(tradeType: keyof typeof TradeTypeToUiOrderType | undefined): UiOrderType | null {
  return tradeType ? TradeTypeToUiOrderType[tradeType] : null
}
