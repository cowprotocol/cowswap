import { OrderClass } from '@cowprotocol/cow-sdk'

import { Order } from 'legacy/state/orders/actions'

import { AppDataMetadataOrderClass } from 'modules/appData/types'
import { decodeAppData } from 'modules/appData/utils/decodeAppData'

/**
 * UI order type that is different from existing types or classes
 *
 * This concept doesn't match what the API returns, as it has no notion of advanced/twap orders
 * It uses order appData if available, otherwise fallback to less reliable ways
 */
export enum UiOrderType {
  SWAP = 'SWAP',
  LIMIT = 'LIMIT',
  TWAP = 'TWAP',
}

const APPDATA_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP: Record<string, UiOrderType> = {
  market: UiOrderType.SWAP,
  limit: UiOrderType.LIMIT,
  liquidity: UiOrderType.LIMIT,
  twap: UiOrderType.TWAP,
}

const API_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP: Record<OrderClass, UiOrderType> = {
  [OrderClass.MARKET]: UiOrderType.SWAP,
  [OrderClass.LIMIT]: UiOrderType.LIMIT,
  [OrderClass.LIQUIDITY]: UiOrderType.LIMIT,
}

export function getUiOrderType({
  fullAppData,
  composableCowInfo,
  class: orderClass,
}: Pick<Order, 'fullAppData' | 'composableCowInfo' | 'class'>): UiOrderType {
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
