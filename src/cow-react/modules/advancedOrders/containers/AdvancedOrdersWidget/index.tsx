import { useSetupTradeState } from '@cow/modules/trade'
import { useAdvancedOrdersState } from '@cow/modules/advancedOrders'

export function AdvancedOrdersWidget() {
  useSetupTradeState()

  const state = useAdvancedOrdersState()

  return (
    <div>
      <h3>Advanced orders</h3>
      <div>inputCurrencyId: {state.inputCurrencyId}</div>
      <div>outputCurrencyId: {state.outputCurrencyId}</div>
    </div>
  )
}
