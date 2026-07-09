import { OrdersState } from 'legacy/state/orders/reducer'
import { atomFromReduxSelector } from 'legacy/utils/atomFromReduxSelector'

export const reduxOrdersStateAtom = atomFromReduxSelector<OrdersState>((appState) => appState.orders)
