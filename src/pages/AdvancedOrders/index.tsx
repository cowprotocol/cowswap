import { AdvancedOrdersWidget } from 'modules/advancedOrders'
import { QuoteUpdater } from 'modules/advancedOrders/updaters/QuoteUpdater'

export default function AdvancedOrdersPage() {
  return (
    <>
      <QuoteUpdater />
      <AdvancedOrdersWidget />
    </>
  )
}
