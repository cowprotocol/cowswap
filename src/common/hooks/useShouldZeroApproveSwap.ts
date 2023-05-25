import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useShouldZeroApprove } from './useShouldZeroApprove'
import { OrderKind } from '@cowprotocol/cow-sdk'

export function useShouldZeroApproveSwap(): boolean {
  const { state } = useDerivedTradeState()

  const amountToApprove = state?.orderKind === OrderKind.SELL ? state.inputCurrencyAmount : state?.outputCurrencyAmount

  return useShouldZeroApprove(amountToApprove)
}
