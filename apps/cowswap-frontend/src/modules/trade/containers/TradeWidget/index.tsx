import { JSX, useEffect } from 'react'

import { SelectTokenWidget, useChainsToSelect, useSelectTokenWidgetState } from 'modules/tokensList'
import { useSetShouldUseAutoSlippage } from 'modules/tradeSlippage'

import * as styledEl from './styled'
import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetModals } from './TradeWidgetModals'
import { TradeWidgetUpdaters } from './TradeWidgetUpdaters'
import { TradeWidgetProps } from './types'

export function TradeWidget(props: TradeWidgetProps): JSX.Element {
  const { id, slots, params, confirmModal, genericModal } = props
  const {
    disableQuotePolling = false,
    disableNativeSelling = false,
    disableSuggestedSlippageApi = false,
    enableSmartSlippage,
  } = params
  const modals = TradeWidgetModals({ confirmModal, genericModal })
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()
  const chainsToSelect = useChainsToSelect()
  const isTokenSelectWide =
    isTokenSelectOpen && !!chainsToSelect && (chainsToSelect.isLoading || (chainsToSelect.chains?.length ?? 0) > 0)

  const selectTokenWidgetNode = isTokenSelectOpen ? (slots.selectTokenWidget ?? <SelectTokenWidget />) : null

  const setShouldUseAutoSlippage = useSetShouldUseAutoSlippage()

  useEffect(() => {
    setShouldUseAutoSlippage(enableSmartSlippage ?? false)
  }, [enableSmartSlippage, setShouldUseAutoSlippage])

  return (
    <>
      <styledEl.Container id={id} isTokenSelectOpen={isTokenSelectOpen} isTokenSelectWide={isTokenSelectWide}>
        <TradeWidgetUpdaters
          disableQuotePolling={disableQuotePolling}
          disableNativeSelling={disableNativeSelling}
          disableSuggestedSlippageApi={disableSuggestedSlippageApi}
          onChangeRecipient={props.actions.onChangeRecipient}
        >
          {slots.updaters}
        </TradeWidgetUpdaters>

        {modals || <TradeWidgetForm {...props} />}
      </styledEl.Container>

      {selectTokenWidgetNode}
    </>
  )
}
