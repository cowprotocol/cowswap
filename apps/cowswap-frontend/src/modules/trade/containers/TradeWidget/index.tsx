import { useSelectTokenWidgetState } from 'modules/tokensList'

import * as styledEl from './styled'
import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetModals } from './TradeWidgetModals'
import { TradeWidgetUpdaters } from './TradeWidgetUpdaters'
import { TradeWidgetProps } from './types'

export function TradeWidget(props: TradeWidgetProps) {
  const { id, slots, params, confirmModal, genericModal } = props
  const { disableQuotePolling = false, disableNativeSelling = false, enableSmartSlippage } = params
  const modals = TradeWidgetModals({ confirmModal, genericModal, selectTokenWidget: slots.selectTokenWidget })
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()

  return (
    <styledEl.Container id={id} isTokenSelectOpen={isTokenSelectOpen}>
      <TradeWidgetUpdaters
        disableQuotePolling={disableQuotePolling}
        disableNativeSelling={disableNativeSelling}
        enableSmartSlippage={enableSmartSlippage}
        onChangeRecipient={props.actions.onChangeRecipient}
      >
        {slots.updaters}
      </TradeWidgetUpdaters>

      {modals || <TradeWidgetForm {...props} />}
    </styledEl.Container>
  )
}
