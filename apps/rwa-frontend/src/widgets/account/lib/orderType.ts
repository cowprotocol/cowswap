import { type EnrichedOrder, OrderClass } from '@cowprotocol/cow-sdk'

export type OrderType = 'swap' | 'limit' | 'twap'

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  swap: 'Swap',
  limit: 'Limit',
  twap: 'TWAP',
}

const APP_DATA_ORDER_TYPES: Record<string, OrderType> = {
  market: 'swap',
  hooks: 'swap',
  limit: 'limit',
  liquidity: 'limit',
  twap: 'twap',
}

/**
 * The app data `orderClass` is what the trade widget placed. The order book `class` is only a fallback:
 * it marks every order without a fee as a limit order, swaps included.
 */
export function getOrderType(order: Pick<EnrichedOrder, 'class' | 'fullAppData'>): OrderType {
  const appDataType = APP_DATA_ORDER_TYPES[readAppDataOrderClass(order.fullAppData) ?? '']

  if (appDataType) return appDataType

  return order.class === OrderClass.MARKET ? 'swap' : 'limit'
}

function getField(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>)[key] : undefined
}

function readAppDataOrderClass(fullAppData: string | null | undefined): string | null {
  if (!fullAppData) return null

  try {
    const appData: unknown = JSON.parse(fullAppData)
    const orderClass = getField(getField(getField(appData, 'metadata'), 'orderClass'), 'orderClass')

    return typeof orderClass === 'string' ? orderClass : null
  } catch {
    return null
  }
}
