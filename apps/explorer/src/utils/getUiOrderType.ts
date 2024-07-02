import { latest } from '@cowprotocol/app-data'
import { OrderClass } from '@cowprotocol/cow-sdk'

import { Order } from 'api/operator'
import { decodeFullAppData } from 'utils/decodeFullAppData'

/**
 * UiOrderType based on appData, falling back to backend order class.
 *
 * Similar to CoW Swap, but not exactly like it.
 *
 * Here, MARKET remains as MARKET, while on CoW Swap it's translated to SWAP.
 * Also, we keep the LIQUIDITY order type as it, while there it's translated to LIMIT.
 *
 * In summary, it matches 1:1 appData.metadata.orderClass.orderClass enum
 */
export enum UiOrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  LIQUIDITY = 'LIQUIDITY',
  TWAP = 'TWAP',
}

const API_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP: Record<OrderClass, UiOrderType> = {
  [OrderClass.MARKET]: UiOrderType.MARKET,
  [OrderClass.LIMIT]: UiOrderType.LIMIT,
  [OrderClass.LIQUIDITY]: UiOrderType.LIQUIDITY,
}

export function getUiOrderType({ fullAppData, class: orderClass }: Order): UiOrderType {
  const appData = decodeFullAppData(fullAppData)

  const appDataOrderClass = appData?.metadata?.orderClass as latest.OrderClass | undefined
  const typeFromAppData = UiOrderType[appDataOrderClass?.orderClass.toUpperCase() || '']

  // 1. AppData info has priority as it's what's more precise
  if (typeFromAppData) {
    return typeFromAppData
  }

  // 3. Fallback to API classification.
  // Least precise as it doesn't distinguish twap type and uses backend logic which doesn't match frontend's classification
  return API_ORDER_CLASS_TO_UI_ORDER_TYPE_MAP[orderClass]
}
