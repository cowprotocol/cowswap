import { serializeToken } from 'state/user/hooks'
import { addPendingOrder, AddPendingOrderParams, SerializedOrder } from 'state/orders/actions'
import { AddUnserialisedPendingOrderParams } from 'state/orders/hooks'
import { AppDispatch } from 'state'

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
