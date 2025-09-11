import { isTruthy } from '@cowprotocol/common-utils'
import { ContractsOrder, OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { computeOrderUid } from 'utils/orderUtils/computeOrderUid'

import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapOrderItem } from '../types'

export async function generateTwapOrderParts(
  twapOrder: TwapOrderItem,
  safeAddress: string,
  chainId: SupportedChainId,
): Promise<{ [id: string]: TwapPartOrderItem[] }> {
  const twapOrderId = twapOrder.id

  const parts = [...new Array(twapOrder.order.n)]
    .map((_, index) => createPartOrderFromParent(twapOrder, index))
    .filter(isTruthy)

  const ids = await Promise.all(parts.map((part) => computeOrderUid(chainId, safeAddress, part as ContractsOrder)))

  return {
    [twapOrderId]: ids.map<TwapPartOrderItem>((uid, index) => {
      return {
        uid,
        index,
        twapOrderId,
        chainId,
        safeAddress,
        isCreatedInOrderBook: false,
        isCancelling: false,
        order: parts[index],
      }
    }),
  }
}

export function createPartOrderFromParent(twapOrder: TwapOrderItem, index: number): OrderParameters | null {
  const executionDate = twapOrder.safeTxParams?.executionDate

  if (!executionDate) {
    return null
  }

  const blockTimestamp = new Date(executionDate)

  return {
    sellToken: twapOrder.order.sellToken,
    buyToken: twapOrder.order.buyToken,
    receiver: twapOrder.order.receiver,
    sellAmount: twapOrder.order.partSellAmount,
    buyAmount: twapOrder.order.minPartLimit,
    validTo: calculateValidTo({
      part: index,
      startTime: Math.ceil(blockTimestamp.getTime() / 1000),
      span: twapOrder.order.span,
      frequency: twapOrder.order.t,
    }),
    appData: twapOrder.order.appData,
    feeAmount: '0',
    kind: 'sell',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
  } as OrderParameters
}

function calculateValidTo({
  part,
  startTime,
  frequency,
  span,
}: {
  part: number
  startTime: number
  frequency: number
  span: number
}): number {
  if (span === 0) {
    return startTime + (part + 1) * frequency - 1
  }

  return startTime + part * frequency + span - 1
}
