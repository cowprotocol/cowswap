import { UiOrderType } from '@cowprotocol/types'

import { getUiOrderType, UiOrderTypeParams } from 'utils/orderUtils/getUiOrderType'

export type LifecycleOrderPayloadInput<T extends { order: LifecycleOrderTypeSource }> = Omit<T, 'orderType'> & {
  orderType?: UiOrderType
}

export type LifecycleOrderTypeSource = Pick<UiOrderTypeParams, 'class' | 'composableCowInfo' | 'fullAppData'>

export function addOrderTypeToLifecyclePayload<T extends { order: LifecycleOrderTypeSource }>(
  payload: T & { orderType?: UiOrderType },
): T & { orderType: UiOrderType } {
  return {
    ...payload,
    orderType: payload.orderType ?? getOrderTypeForLifecycleEvent(payload.order),
  }
}

export function getOrderTypeForLifecycleEvent(order: LifecycleOrderTypeSource): UiOrderType {
  return getUiOrderType(order)
}
