import { BridgeDetails, BridgeStatus } from '@cowprotocol/bridge'

export interface BridgeStatusResult {
  isWaiting: boolean
  actualStatus: string
}

export interface GetBridgeStatusParams {
  bridgeDetails?: BridgeDetails
  swapStatus?: string
  partiallyFilled?: boolean
}

/**
 * Determines the effective bridge status based on swap completion status.
 *
 * When a swap is not yet complete but the bridge shows as "pending",
 * the bridge is actually "waiting for swap to complete" rather than truly pending.
 *
 * @param params - Object containing bridgeDetails, swapStatus, and partiallyFilled
 * @returns Object with isWaiting boolean and actualStatus string
 */
export function getBridgeStatus({
  bridgeDetails,
  swapStatus,
  partiallyFilled,
}: GetBridgeStatusParams): BridgeStatusResult {
  if (!bridgeDetails) {
    return { isWaiting: false, actualStatus: 'unknown' }
  }

  const isSwapComplete = swapStatus === 'filled' || partiallyFilled

  // If swap is not complete but bridge shows as pending, it's actually waiting
  if (!isSwapComplete && bridgeDetails.status === BridgeStatus.Pending) {
    return { isWaiting: true, actualStatus: bridgeDetails.status }
  }

  // For all other cases, use the actual bridge status
  return { isWaiting: false, actualStatus: bridgeDetails.status }
}
