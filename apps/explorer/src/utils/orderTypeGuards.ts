import { BridgeDetails } from '../types/bridge' // Adjust path as necessary

// A generic order-like type. The real Order type is in 'api/operator'
// but we want to keep utils potentially reusable or less coupled.
interface OrderLike {
  uid: string // Example mandatory field for an order
  bridgeDetails?: BridgeDetails
}

// Type guard to check if an order is a swap-and-bridge order
export function isSwapAndBridgeOrder(order: OrderLike | any): order is OrderLike & { bridgeDetails: BridgeDetails } {
  return order && typeof order === 'object' && order.bridgeDetails !== undefined
}
