import { getIsNativeToken } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from './useDerivedTradeState'

export function useIsSellNative() {
  const tradeState = useDerivedTradeState()

  return tradeState?.inputCurrency ? getIsNativeToken(tradeState.inputCurrency) : false
}
