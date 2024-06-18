import { TradeFormButtons, useGetTradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'

const doTradeText = ''
const confirmText = ''
const confirmTrade = () => void 0

/**
 * This component is used only to display a button for Wrap/Unwrap
 * because of it, we just stub parameters above
 */
export function WrapFlowActionButton() {
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeFormButtonContext = useTradeFormButtonContext(doTradeText, confirmTrade)

  if (!tradeFormButtonContext) return null

  return (
    <TradeFormButtons confirmText={confirmText} validation={primaryFormValidation} context={tradeFormButtonContext} />
  )
}
