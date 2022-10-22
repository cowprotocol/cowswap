import { serializeToken } from 'state/user/hooks'
import { addPendingEthFlowOrder, AddPendingOrderParams, SerializedOrder } from 'state/orders/actions'
import { AddUnserialisedPendingEthFlowOrderParams } from 'state/orders/hooks'
import { AppDispatch } from 'state'

export function addPendingEthFlowOrderStep(
  addOrderParams: AddUnserialisedPendingEthFlowOrderParams,
  dispatch: AppDispatch
) {
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
  dispatch(addPendingEthFlowOrder(params))
}
