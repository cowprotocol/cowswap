import { RoutesValues } from 'common/constants/routes'

export enum TradeType {
  SWAP = 'SWAP',
  LIMIT_ORDER = 'LIMIT_ORDER',
  ADVANCED_ORDERS = 'ADVANCED_ORDERS',
  YIELD = 'YIELD',
}

export interface TradeTypeInfo {
  tradeType: TradeType
  route: RoutesValues
}
