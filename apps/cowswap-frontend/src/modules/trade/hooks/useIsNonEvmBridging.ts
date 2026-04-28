import { isEvmChain } from '@cowprotocol/cow-sdk'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'

export function useIsNonEvmBridging(): boolean {
  const isBridging = useIsCurrentTradeBridging()
  const derivedTradeState = useDerivedTradeState()
  const outputCurrency = derivedTradeState?.outputCurrency

  return isBridging && !!outputCurrency && !isEvmChain(outputCurrency.chainId)
}
