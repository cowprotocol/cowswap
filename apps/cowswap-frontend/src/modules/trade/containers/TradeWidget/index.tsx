import { JSX, useEffect } from 'react'

import { useTokenSelectorConsentFlow } from 'modules/rwa'
import { SelectTokenWidget, useSelectTokenWidgetState } from 'modules/tokensList'
import { useSetShouldUseAutoSlippage } from 'modules/tradeSlippage'

import * as styledEl from './styled'
import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetModals } from './TradeWidgetModals'
import { TradeWidgetUpdaters } from './TradeWidgetUpdaters'
import { TradeWidgetProps } from './types'

import { useIsTokenSelectWide } from '../../hooks/useIsTokenSelectWide'

export function TradeWidget(props: TradeWidgetProps): JSX.Element {
  const { id, slots, params, confirmModal, genericModal } = props
  const {
    disableQuotePolling = false,
    disableNativeSelling = false,
    disableSuggestedSlippageApi = false,
    allowSwapSameToken = false,
    enableSmartSlippage,
  } = params
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()
  const isTokenSelectWide = useIsTokenSelectWide()

  const consentFlow = useTokenSelectorConsentFlow()
  const selectTokenWidgetNode = slots.selectTokenWidget ?? <SelectTokenWidget customFlows={consentFlow} />

  const setShouldUseAutoSlippage = useSetShouldUseAutoSlippage()

  useEffect(() => {
    setShouldUseAutoSlippage(enableSmartSlippage ?? false)
  }, [enableSmartSlippage, setShouldUseAutoSlippage])

  const modals = (
    <TradeWidgetModals
      confirmModal={confirmModal}
      genericModal={genericModal}
      renderFallback={ () => <TradeWidgetForm {...props} /> }
    />
  )

  return (
    <>
      <styledEl.Container id={id} isTokenSelectOpen={isTokenSelectOpen} isTokenSelectWide={isTokenSelectWide}>
        <TradeWidgetUpdaters
          allowSwapSameToken={allowSwapSameToken}
          disableQuotePolling={disableQuotePolling}
          disableNativeSelling={disableNativeSelling}
          disableSuggestedSlippageApi={disableSuggestedSlippageApi}
          onChangeRecipient={props.actions.onChangeRecipient}
        >
          {slots.updaters}
        </TradeWidgetUpdaters>

        { modals }
      </styledEl.Container>

      {selectTokenWidgetNode}
    </>
  )
}
