import * as styledEl from './styled'
import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetModals } from './TradeWidgetModals'
import { TradeWidgetUpdaters } from './TradeWidgetUpdaters'
import { TradeWidgetProps } from './types'

import { useTradeFlowContext } from '../../../limitOrders/hooks/useTradeFlowContext'
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
  const tradeContext = useTradeFlowContext()

  // Inject the banner into the slots and use it as lockScreen when visible
  const slotsWithBanner = {
    ...slots,
    topContent: <>{isVisible ? <LimitOrdersPromoBannerWrapper /> : slots.topContent}</>,
    // TODO: Refactor to pass lockScreen as children to LimitOrdersPromoBannerWrapper instead of conditional rendering
    // i.e.: <LimitOrdersPromoBannerWrapper>{slots.lockScreen}</LimitOrdersPromoBannerWrapper>
    lockScreen: isVisible ? <LimitOrdersPromoBannerWrapper /> : slots.lockScreen,
    // Pass trade context to bottomContent
    bottomContent: (warnings: React.ReactNode | null) => {
      if (!slots.bottomContent) return null
      return slots.bottomContent(warnings, !!tradeContext)
    },
  }

  return (
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
  )
}
