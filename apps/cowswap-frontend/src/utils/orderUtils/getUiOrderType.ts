import { OrderClass } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { Order } from 'legacy/state/orders/actions'

import { AppDataMetadataOrderClass } from 'modules/appData/types'
import { decodeAppData } from 'modules/appData/utils/decodeAppData'

const APPDATA_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP: Record<string, UiOrderType> = {
  market: UiOrderType.SWAP,
  limit: UiOrderType.LIMIT,
  liquidity: UiOrderType.LIMIT,
  twap: UiOrderType.TWAP,
  hooks: UiOrderType.HOOKS,
}

const API_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP: Record<OrderClass, UiOrderType> = {
  [OrderClass.MARKET]: UiOrderType.SWAP,
  [OrderClass.LIMIT]: UiOrderType.LIMIT,
  [OrderClass.LIQUIDITY]: UiOrderType.LIMIT,
}

export const ORDER_UI_TYPE_TITLES: Record<UiOrderType, string> = {
  [UiOrderType.SWAP]: 'Swap',
  [UiOrderType.LIMIT]: 'Limit order',
  [UiOrderType.TWAP]: 'TWAP order',
  [UiOrderType.HOOKS]: 'Hooks',
  [UiOrderType.YIELD]: 'Yield',
}

export type UiOrderTypeParams = Pick<Order, 'fullAppData' | 'composableCowInfo' | 'class'>

export function getUiOrderType({ fullAppData, composableCowInfo, class: orderClass }: UiOrderTypeParams): UiOrderType {
  const parsedAppData = decodeAppData(fullAppData)

  const appDataOrderClass = parsedAppData?.metadata?.orderClass as AppDataMetadataOrderClass | undefined
  const typeFromAppData = APPDATA_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP[appDataOrderClass?.orderClass || '']

  // 1. AppData info has priority as it's what's more precise
  if (typeFromAppData) {
    return typeFromAppData
  }

  // 2. If composableCowInfo is available, we know it to be a twap
  if (composableCowInfo) {
    return UiOrderType.TWAP
  }

  // 3. As a last resort, map it to API classification.
  // Least precise as it doesn't distinguish twap type and uses backend logic which doesn't match frontend's classification
  return API_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP[orderClass]
}
