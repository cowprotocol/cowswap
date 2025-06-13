import { AppDispatch } from 'legacy/state'
import { addPendingOrder, AddPendingOrderParams, SerializedOrder } from 'legacy/state/orders/actions'
import { AddUnserialisedPendingOrderParams } from 'legacy/state/orders/hooks'
import { serializeToken } from 'legacy/state/user/hooks'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function addPendingOrderStep(addOrderParams: AddUnserialisedPendingOrderParams, dispatch: AppDispatch) {
  const serialisedSellToken = serializeToken(addOrderParams.order.inputToken)
  const serialisedBuyToken = serializeToken(addOrderParams.order.outputToken)
  const order: SerializedOrder = {
    ...addOrderParams.order,
    inputToken: serialisedSellToken,
    outputToken: serialisedBuyToken,
  }

  const params: AddPendingOrderParams = {
    ...addOrderParams,
    order,
  }
  dispatch(addPendingOrder(params))
}
