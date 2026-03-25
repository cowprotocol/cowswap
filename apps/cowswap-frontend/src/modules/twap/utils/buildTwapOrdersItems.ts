import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TwapOrdersList } from 'entities/twap'

import { getTwapOrderStatus } from './getTwapOrderStatus'
import { parseTwapOrderStruct } from './parseTwapOrderStruct'

import { DEFAULT_TWAP_EXECUTION } from '../const'
import { TwapOrdersExecutionMap } from '../hooks/useTwapOrdersExecutions'
import {
  TwapOrderInfo,
  TwapOrderItem,
  TwapOrdersAuthResult,
  TwapOrdersExecution,
  TwapOrdersSafeData,
  TwapOrderStatus,
} from '../types'

import type { Hex } from 'viem'

export function buildTwapOrdersItems(
  chainId: SupportedChainId,
  safeAddress: string,
  ordersInfo: TwapOrderInfo[],
  ordersAuthResult: TwapOrdersAuthResult,
  twapOrderExecutions: TwapOrdersExecutionMap,
): TwapOrdersList {
  return ordersInfo.reduce<TwapOrdersList>((acc, { safeData, id }) => {
    acc[id] = getTwapOrderItem(
      chainId,
      safeAddress,
      safeData,
      id as `0x${string}`,
      ordersAuthResult[id],
      twapOrderExecutions[id] ?? DEFAULT_TWAP_EXECUTION,
    )
    return acc
  }, {})
}

/**
 * When a Safe proposal executes it disappears from the pending-queue snapshot (`allOrdersInfo`), but
 * the UI row still exists as `WaitSigning`. Merge those rows using `singleOrders` (auth) until the
 * order reaches a terminal status.
 */
export function mergePersistedSigningTwapOrders(
  items: TwapOrdersList,
  twapOrdersList: TwapOrdersList,
  ordersAuthResult: TwapOrdersAuthResult,
  twapOrderExecutions: TwapOrdersExecutionMap,
): TwapOrdersList {
  const next = { ...items }

  for (const [id, stored] of Object.entries(twapOrdersList)) {
    if (stored.status !== TwapOrderStatus.WaitSigning || next[id]) {
      continue
    }

    const authorized = ordersAuthResult[id]

    console.log('[mergePersistedSigningTwapOrders]', {
      id: id.slice(0, 10),
      storedStatus: stored.status,
      authorized,
      isInBuiltItems: !!next[id],
      authResultKeys: Object.keys(ordersAuthResult).map((k) => k.slice(0, 10)),
    })

    if (authorized === undefined) {
      continue
    }

    const executionInfo = twapOrderExecutions[id] ?? DEFAULT_TWAP_EXECUTION
    const executionDate = stored.safeTxParams?.executionDate ? new Date(stored.safeTxParams.executionDate) : null
    const isExecuted = stored.safeTxParams?.isExecuted ?? false

    const status = getTwapOrderStatus(stored.order, isExecuted, executionDate, authorized, executionInfo)

    console.log('[mergePersistedSigningTwapOrders]', {
      id: id.slice(0, 10),
      storedStatus: stored.status,
      newStatus: status,
      authorized,
      isExecuted,
      executionDate: executionDate?.toISOString() ?? null,
    })

    next[id] = {
      ...stored,
      status,
      executionInfo,
    }
  }

  return next
}

function getTwapOrderItem(
  chainId: SupportedChainId,
  safeAddress: string,
  safeData: TwapOrdersSafeData,
  id: Hex,
  authorized: boolean | undefined,
  executionInfo: TwapOrdersExecution,
): TwapOrderItem {
  const { conditionalOrderParams, safeTxParams } = safeData
  const { isExecuted, submissionDate, executionDate: _executionDate } = safeTxParams

  const executionDate = _executionDate ? new Date(_executionDate) : null
  const order = parseTwapOrderStruct(conditionalOrderParams.staticInput as `0x${string}`)
  const status = getTwapOrderStatus(order, isExecuted, executionDate, authorized, executionInfo)

  return {
    order,
    status,
    chainId,
    safeAddress,
    id,
    submissionDate,
    executedDate: _executionDate || undefined,
    safeTxParams,
    executionInfo,
  }
}
