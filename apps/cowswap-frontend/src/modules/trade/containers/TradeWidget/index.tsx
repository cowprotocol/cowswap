import React from 'react'

import * as styledEl from './styled'
import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetModals } from './TradeWidgetModals'
import { TradeWidgetUpdaters } from './TradeWidgetUpdaters'
import { TradeWidgetProps } from './types'

export const TradeWidgetContainer = styledEl.Container

export function TradeWidget(props: TradeWidgetProps) {
  const { id, slots, params, children: confirmModal } = props
  const { disableQuotePolling = false, disableNativeSelling = false } = params
  const modals = TradeWidgetModals(confirmModal)

  return (
    <>
      <styledEl.Container id={id}>
        <TradeWidgetUpdaters disableQuotePolling={disableQuotePolling} disableNativeSelling={disableNativeSelling}>
          {slots.updaters}
        </TradeWidgetUpdaters>

        <styledEl.Container>{modals || <TradeWidgetForm {...props} />}</styledEl.Container>
      </styledEl.Container>
    </>
  )
}
