import { OrdersStateNetwork, PartialOrdersMap } from 'legacy/state/orders/reducer'

export function flatOrdersStateNetwork(state: OrdersStateNetwork): PartialOrdersMap {
  return {
    ...state.pending,
    ...state.presignaturePending,
    ...state.fulfilled,
    ...state.expired,
    ...state.cancelled,
    ...state.creating,
    ...state.failed,
    ...state.scheduled,
  }
}
