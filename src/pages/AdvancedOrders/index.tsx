import { AdvancedOrdersWidget } from 'modules/advancedOrders'
import { TradeQuoteUpdater } from 'modules/tradeQuote'

export default function AdvancedOrdersPage() {
  return (
    <>
      <TradeQuoteUpdater />
      <AdvancedOrdersWidget />
    </>
  )
}
