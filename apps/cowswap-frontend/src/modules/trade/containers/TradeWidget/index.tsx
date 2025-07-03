import { JSX, useEffect } from 'react'

import { useSelectTokenWidgetState } from 'modules/tokensList'
import { useSetShouldUseAutoSlippage } from 'modules/tradeSlippage'

import * as styledEl from './styled'
import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetModals } from './TradeWidgetModals'
import { TradeWidgetUpdaters } from './TradeWidgetUpdaters'
import { TradeWidgetProps } from './types'

export function TradeWidget(props: TradeWidgetProps): JSX.Element {
  const { id, slots, params, confirmModal, genericModal } = props
  const { disableQuotePolling = false, disableNativeSelling = false, enableSmartSlippage } = params
  const modals = TradeWidgetModals({ confirmModal, genericModal, selectTokenWidget: slots.selectTokenWidget })
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()

  const setShouldUseAutoSlippage = useSetShouldUseAutoSlippage()

  useEffect(() => {
    setShouldUseAutoSlippage(enableSmartSlippage ?? false)
  }, [enableSmartSlippage, setShouldUseAutoSlippage])

  return (
    <styledEl.Container id={id} isTokenSelectOpen={isTokenSelectOpen}>
      <TradeWidgetUpdaters
        disableQuotePolling={disableQuotePolling}
        disableNativeSelling={disableNativeSelling}
        onChangeRecipient={props.actions.onChangeRecipient}
      >
        {slots.updaters}
      </TradeWidgetUpdaters>

      {modals || <TradeWidgetForm {...props} />}
    </styledEl.Container>
  )
}
