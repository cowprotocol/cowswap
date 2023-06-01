import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

import { useTradeApproveState } from 'common/containers/TradeApprove'
import { useIsTxBundlingEnabled } from 'common/hooks/useIsTxBundlingEnabled'

import { TradeFormValidationContext, TradeFormValidationLocalContext } from '../types'

export function useTradeFormValidationContext(
  localContext: TradeFormValidationLocalContext
): TradeFormValidationContext {
  const derivedTradeState = useDerivedTradeState()
  const { slippageAdjustedSellAmount } = derivedTradeState.state || {}
  const isTxBundlingEnabled = useIsTxBundlingEnabled()
  const approvalState = useTradeApproveState(slippageAdjustedSellAmount)

  return {
    ...localContext,
    isTxBundlingEnabled,
    approvalState,
  }
}
