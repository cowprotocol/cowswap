import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { defaultAbiCoder } from '@ethersproject/abi'
import { hexZeroPad } from '@ethersproject/bytes'

import { getConditionalOrderId } from './getConditionalOrderId'
import { twapOrderToStruct } from './twapOrderToStruct'

import { DEFAULT_TWAP_EXECUTION_INFO, TWAP_HANDLER_ADDRESS, TWAP_ORDER_STRUCT } from '../const'
import {
  ConditionalOrderParams,
  TWAPOrder,
  TwapOrderItem,
  TwapOrdersExecution,
  TwapOrderStatus,
  TwapPrototypeSimulation,
} from '../types'

interface BuildPrototypeTwapOrderItemParams {
  chainId: SupportedChainId
  ownerAddress: string
  twapOrder: TWAPOrder
  status: TwapOrderStatus
  submissionDate: string
  executedDate?: string
  saltSeed: number
  confirmedPartsCount?: number
  prototypeSimulation?: TwapPrototypeSimulation
}

export function buildPrototypeTwapOrderItem(params: BuildPrototypeTwapOrderItemParams): TwapOrderItem {
  const {
    chainId,
    ownerAddress,
    twapOrder,
    status,
    submissionDate,
    executedDate,
    saltSeed,
    confirmedPartsCount,
    prototypeSimulation,
  } = params
  const order = twapOrderToStruct(twapOrder)
  const executionInfo = getPrototypeTwapExecution(order, status, confirmedPartsCount)
  const conditionalOrderParams = buildPrototypeConditionalOrderParams(chainId, order, saltSeed)

  return {
    order,
    status,
    chainId,
    submissionDate,
    executedDate,
    safeAddress: ownerAddress,
    id: getConditionalOrderId(conditionalOrderParams),
    executionInfo,
    isPrototype: true,
    prototypeSimulation,
  }
}

export function getPrototypeTwapExecution(
  order: TwapOrderItem['order'],
  status: TwapOrderStatus,
  confirmedPartsCount?: number,
): TwapOrdersExecution {
  const normalizedPartsCount = normalizeConfirmedPartsCount(order.n, status, confirmedPartsCount)
  const executedSellAmount = BigInt(order.partSellAmount) * BigInt(normalizedPartsCount)
  const executedBuyAmount = BigInt(order.minPartLimit) * BigInt(normalizedPartsCount)

  return {
    confirmedPartsCount: normalizedPartsCount,
    info: {
      ...DEFAULT_TWAP_EXECUTION_INFO,
      executedSellAmount: executedSellAmount.toString(),
      executedBuyAmount: executedBuyAmount.toString(),
    },
  }
}

function buildPrototypeConditionalOrderParams(
  chainId: SupportedChainId,
  order: TwapOrderItem['order'],
  saltSeed: number,
): ConditionalOrderParams {
  return {
    handler: TWAP_HANDLER_ADDRESS[chainId],
    salt: hexZeroPad(`0x${saltSeed.toString(16)}`, 32),
    staticInput: defaultAbiCoder.encode([TWAP_ORDER_STRUCT], [order]),
  }
}

function normalizeConfirmedPartsCount(
  totalParts: number,
  status: TwapOrderStatus,
  confirmedPartsCount?: number,
): number {
  if (typeof confirmedPartsCount === 'number') {
    return Math.max(0, Math.min(totalParts, Math.floor(confirmedPartsCount)))
  }

  if (status === TwapOrderStatus.Fulfilled) {
    return totalParts
  }

  return 0
}
