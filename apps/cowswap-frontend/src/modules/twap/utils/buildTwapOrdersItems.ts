import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TwapOrdersList } from 'entities/twap'

import { getTwapOrderStatus } from './getTwapOrderStatus'
import { parseTwapOrderStruct } from './parseTwapOrderStruct'

import { DEFAULT_TWAP_EXECUTION } from '../const'
import { TwapOrdersExecutionMap } from '../hooks/useTwapOrdersExecutions'
import {
  type TwapOrderInfo,
  type TwapOrderItem,
  type TwapOrdersAuthResult,
  type TwapOrdersExecution,
  type TwapOrdersSafeData,
  TwapOrderStatus,
} from '../types'

import type { Hex } from 'viem'

export function buildTwapOrdersItems(
  chainId: SupportedChainId,
  safeAddress: string,
  ordersInfo: TwapOrderInfo[],
  ordersAuthResult: TwapOrdersAuthResult,
  twapOrderExecutions: TwapOrdersExecutionMap,
  isFallbackHandlerBroken: boolean,
): TwapOrdersList {
  return ordersInfo.reduce<TwapOrdersList>((acc, { safeData, id }) => {
    acc[id] = getTwapOrderItem(
      chainId,
      safeAddress,
      safeData,
      id as `0x${string}`,
      ordersAuthResult[id],
      twapOrderExecutions[id] ?? DEFAULT_TWAP_EXECUTION,
      isFallbackHandlerBroken,
    )
    return acc
  }, {})
}

function getTwapOrderItem(
  chainId: SupportedChainId,
  safeAddress: string,
  safeData: TwapOrdersSafeData,
  id: Hex,
  authorized: boolean | undefined,
  executionInfo: TwapOrdersExecution,
  isFallbackHandlerBroken: boolean,
): TwapOrderItem {
  const { conditionalOrderParams, safeTxParams } = safeData
  const { isExecuted, submissionDate, executionDate: _executionDate } = safeTxParams

  const executionDate = _executionDate ? new Date(_executionDate) : null
  const order = parseTwapOrderStruct(conditionalOrderParams.staticInput as `0x${string}`)
  const status = getTwapOrderStatus(order, isExecuted, executionDate, authorized, executionInfo)

  // An open (Pending) order will never be picked up by watchtower when the Safe's
  // ComposableCoW fallback handler has been reset/removed, so surface it as Unfillable.
  const isUnfillable = isFallbackHandlerBroken && status === TwapOrderStatus.Pending

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
    isUnfillable,
  }
}
