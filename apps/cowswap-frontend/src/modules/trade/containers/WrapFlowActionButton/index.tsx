import { TradeFormButtons, useGetTradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'

const doTradeText = ''
const confirmText = ''
const tradeCallbacks = { doTrade() {}, confirmTrade() {} }

/**
 * This component is used only to display a button for Wrap/Unwrap
 * because of it, we just stub parameters above
 */
export function WrapFlowActionButton() {
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeFormButtonContext = useTradeFormButtonContext(doTradeText, tradeCallbacks)

  if (!tradeFormButtonContext) return null

  return (
    <TradeFormButtons confirmText={confirmText} validation={primaryFormValidation} context={tradeFormButtonContext} />
  )
}
