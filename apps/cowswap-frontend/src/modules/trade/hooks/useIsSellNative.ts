import { getIsNativeToken } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from './useDerivedTradeState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsSellNative() {
  const tradeState = useDerivedTradeState()

  return tradeState?.inputCurrency ? getIsNativeToken(tradeState.inputCurrency) : false
}
