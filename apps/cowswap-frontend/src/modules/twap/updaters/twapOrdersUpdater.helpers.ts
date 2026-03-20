import { TwapOrdersList } from 'entities/twap'

import { shouldCheckOrderAuth } from './shouldCheckOrderAuth'

import { TwapOrderInfo, TwapOrderStatus } from '../types'

/**
 * Ids to include in `singleOrders` multicall: from Safe snapshot + WaitSigning rows missing from API
 * after execution (pending queue no longer lists them).
 */
export function buildPendingTwapOrderIds(allOrdersInfo: TwapOrderInfo[], twapOrdersList: TwapOrdersList): string[] {
  const ids = new Set<string>()

  for (const info of allOrdersInfo) {
    if (shouldCheckOrderAuth(info, twapOrdersList[info.id])) {
      ids.add(info.id)
    }
  }

  for (const [id, o] of Object.entries(twapOrdersList)) {
    if (o.status === TwapOrderStatus.WaitSigning && !allOrdersInfo.some((i) => i.id === id)) {
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
