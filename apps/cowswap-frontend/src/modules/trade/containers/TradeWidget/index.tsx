import * as styledEl from './styled'
import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetModals } from './TradeWidgetModals'
import { TradeWidgetUpdaters } from './TradeWidgetUpdaters'
import { TradeWidgetProps } from './types'

import { useLimitOrdersPromoBanner } from '../../hooks/useLimitOrdersPromoBanner'
import { LimitOrdersPromoBannerWrapper } from '../LimitOrdersPromoBannerWrapper'

export const TradeWidgetContainer = styledEl.Container

export function TradeWidget(props: TradeWidgetProps) {
  const { id, slots, params, confirmModal, genericModal } = props
  const {
    disableQuotePolling = false,
    disableNativeSelling = false,
    tradeQuoteStateOverride,
    enableSmartSlippage,
  } = params
  const modals = TradeWidgetModals({ confirmModal, genericModal, selectTokenWidget: slots.selectTokenWidget })
  const { isVisible } = useLimitOrdersPromoBanner()

  // Inject the banner into the slots and use it as lockScreen when visible
  const slotsWithBanner = {
    ...slots,
    topContent: (
      <>
        <LimitOrdersPromoBannerWrapper />
        {slots.topContent}
      </>
    ),
    // Only use banner as lockScreen when it's visible, otherwise use original lockScreen
    lockScreen: isVisible ? <LimitOrdersPromoBannerWrapper /> : slots.lockScreen,
  }

  return (
    <>
      <styledEl.Container id={id}>
        <TradeWidgetUpdaters
          disableQuotePolling={disableQuotePolling}
          disableNativeSelling={disableNativeSelling}
          tradeQuoteStateOverride={tradeQuoteStateOverride}
          enableSmartSlippage={enableSmartSlippage}
          onChangeRecipient={props.actions.onChangeRecipient}
        >
          {slots.updaters}
        </TradeWidgetUpdaters>

        <styledEl.Container>{modals || <TradeWidgetForm {...props} slots={slotsWithBanner} />}</styledEl.Container>
      </styledEl.Container>
    </>
  )
}
