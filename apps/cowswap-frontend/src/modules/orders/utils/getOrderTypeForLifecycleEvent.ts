import { UiOrderType } from '@cowprotocol/types'

import { getUiOrderType, UiOrderTypeParams } from 'utils/orderUtils/getUiOrderType'

export type LifecycleOrderTypeSource = Pick<UiOrderTypeParams, 'class' | 'composableCowInfo' | 'fullAppData'>

export type LifecycleOrderPayloadInput<T extends { order: LifecycleOrderTypeSource }> = Omit<T, 'orderType'> & {
  orderType?: UiOrderType
}

export function getOrderTypeForLifecycleEvent(order: LifecycleOrderTypeSource): UiOrderType {
  return getUiOrderType(order)
}

export function addOrderTypeToLifecyclePayload<T extends { order: LifecycleOrderTypeSource }>(
  payload: T & { orderType?: UiOrderType },
): T & { orderType: UiOrderType } {
  return {
    ...payload,
    orderType: payload.orderType ?? getOrderTypeForLifecycleEvent(payload.order),
  }
}
