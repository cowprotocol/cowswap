import { AdvancedOrdersWidget } from '@cow/modules/advancedOrders'
import { QuoteUpdater } from '@cow/modules/advancedOrders/updaters/QuoteUpdater'

export default function AdvancedOrdersPage() {
  return (
    <>
      <QuoteUpdater />
      <AdvancedOrdersWidget />
    </>
  )
}
