import { useNavigate } from 'common/hooks/useNavigate'

import * as styledEl from './styled'
import { TradeWidgetForm } from './TradeWidgetForm'
import { TradeWidgetModals } from './TradeWidgetModals'
import { TradeWidgetUpdaters } from './TradeWidgetUpdaters'
import { TradeWidgetProps } from './types'

import { useLimitOrdersPromoBanner } from '../../hooks/useLimitOrdersPromoBanner'
import { LimitOrdersPromoBanner } from '../../pure/LimitOrdersPromoBanner'

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

  const { isVisible, onDismiss, isLimitOrdersTab } = useLimitOrdersPromoBanner()
  const navigate = useNavigate()

  const handleCtaClick = () => {
    // First dismiss the banner
    onDismiss()
    // Navigate to limit orders
    navigate('/limit')
  }

  // Inject the banner into the slots and use it as lockScreen when visible
  const slotsWithBanner = {
    ...slots,
    topContent: (
      <>
        {isVisible && (
          <LimitOrdersPromoBanner
            onCtaClick={handleCtaClick}
            onDismiss={onDismiss}
            isLimitOrdersTab={isLimitOrdersTab}
          />
        )}
        {slots.topContent}
      </>
    ),
    // When banner is visible, use it as lockScreen to hide the rest of the content
    lockScreen: isVisible ? (
      <LimitOrdersPromoBanner onCtaClick={handleCtaClick} onDismiss={onDismiss} isLimitOrdersTab={isLimitOrdersTab} />
    ) : (
      slots.lockScreen
    ),
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
