import { UpdateOrderParams } from '@src/state/orders/hooks'
import { AppDispatch } from '@src/state'
import { updateOrder, UpdateOrderParams as UpdateOrderParamsAction } from '@src/state/orders/actions'
import { serializeToken } from '@src/state/user/hooks'

export function partialOrderUpdate({ chainId, order }: UpdateOrderParams, dispatch: AppDispatch): void {
  const params: UpdateOrderParamsAction = {
    chainId,
    order: {
      ...order,
      ...(order.inputToken && { inputToken: serializeToken(order.inputToken) }),
      ...(order.outputToken && { outputToken: serializeToken(order.outputToken) }),
    },
  }
  dispatch(updateOrder(params))
}
