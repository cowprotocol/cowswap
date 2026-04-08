import { TwapOrdersList } from 'entities/twap'

import { shouldCheckOrderAuth } from './shouldCheckOrderAuth'

import { TwapOrderInfo, TwapOrderStatus } from '../types'

/**
 * Ids to include in `singleOrders` multicall: from Safe snapshot + orders missing from API
 * that need their auth status verified.
 */
export function buildPendingTwapOrderIds(allOrdersInfo: TwapOrderInfo[], twapOrdersList: TwapOrdersList): string[] {
  const ids = new Set<string>()
  const idsFromSafe = new Set(allOrdersInfo.map((i) => i.id))

  for (const info of allOrdersInfo) {
    if (shouldCheckOrderAuth(info, twapOrdersList[info.id])) {
      ids.add(info.id)
    }
  }

  for (const [id, o] of Object.entries(twapOrdersList)) {
    // Include orders not in Safe data that need auth verification:
    // - WaitSigning: might have been executed
    // - Pending: might have been cancelled (e.g., after failed cancellation tx was reset)
    // - Cancelling: need to verify if cancellation succeeded
    const needsAuthCheck =
      o.status === TwapOrderStatus.WaitSigning ||
      o.status === TwapOrderStatus.Pending ||
      o.status === TwapOrderStatus.Cancelling

    if (needsAuthCheck && !idsFromSafe.has(id)) {
      ids.add(id)
    }
  }

  return [...ids]
}

export function getOrphanedOptimisticSigningIds(
  allOrdersInfo: TwapOrderInfo[],
  twapOrdersList: TwapOrdersList,
  now: number,
  maxAgeMs: number,
): string[] {
  const idsFromSafe = new Set(allOrdersInfo.map((i) => i.id))

  return Object.entries(twapOrdersList)
    .filter(([orderId, o]) => {
      if (o.status !== TwapOrderStatus.WaitSigning || idsFromSafe.has(orderId)) {
        return false
      }
      if (o.safeTxParams !== undefined) {
        return false
      }
      const submitted = Date.parse(o.submissionDate)
      return Number.isFinite(submitted) && now - submitted > maxAgeMs
    })
    .map(([orderId]) => orderId)
}

export function getStaleNonceOrderIds(
  allOrdersInfo: TwapOrderInfo[],
  safeNonce: string | number | undefined,
): string[] {
  if (safeNonce === undefined) return []

  return allOrdersInfo
    .filter((data) => {
      const { nonce, isExecuted } = data.safeData.safeTxParams
      return !isExecuted && BigInt(nonce) < BigInt(safeNonce)
    })
    .map((item) => item.id)
}
