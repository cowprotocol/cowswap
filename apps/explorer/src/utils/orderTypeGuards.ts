import { BridgeDetails } from '../types/bridge' // Adjust path as necessary

// A generic order-like type. The real Order type is in 'api/operator'
// but we want to keep utils potentially reusable or less coupled.
interface OrderLike {
  uid: string // Example mandatory field for an order
  bridgeDetails?: BridgeDetails
  // other order fields...
}

// Type guard to check if an order is a swap-and-bridge order
export function isSwapAndBridgeOrder(
  order: OrderLike | unknown,
): order is OrderLike & { bridgeDetails: BridgeDetails } {
  return Boolean(
    order &&
      typeof order === 'object' &&
      'bridgeDetails' in order &&
      order.bridgeDetails && // Ensures bridgeDetails is not null or undefined
      typeof order.bridgeDetails === 'object' && // Ensures bridgeDetails is an object
      'providerName' in order.bridgeDetails, // Example: Check for a mandatory field within bridgeDetails
  )
}
