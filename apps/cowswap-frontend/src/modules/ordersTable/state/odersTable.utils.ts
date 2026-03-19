import { cowSwapStore } from 'legacy/state'
import {
  SetIsOrderUnfillableParams,
  setIsOrderUnfillable as createSetIsOrderUnfillableAction,
} from 'legacy/state/orders/actions'

export function setIsOrderUnfillable(params: SetIsOrderUnfillableParams): void {
  cowSwapStore.dispatch(createSetIsOrderUnfillableAction(params))
}
