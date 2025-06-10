import { useSetAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { Order } from '@cowprotocol/contracts'
import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { computeOrderUid } from 'utils/orderUtils/computeOrderUid'

import { twapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapPartOrderItem, setPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderItem } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PartOrdersUpdater() {
  const { chainId, account } = useWalletInfo()
  const twapOrders = useAtomValue(twapOrdersListAtom)
  const updateTwapPartOrders = useSetAtom(setPartOrdersAtom)

  useEffect(() => {
    if (!chainId || !account) return

    const accountLowerCase = account.toLowerCase()

    const ordersParts$ = twapOrders.map((twapOrder) => {
      return generateTwapOrderParts(twapOrder, accountLowerCase, chainId)
    })

    Promise.all(ordersParts$).then((ordersParts) => {
      const ordersMap = ordersParts.reduce((acc, item) => {
        return {
          ...acc,
          ...item,
        }
      }, {})

      updateTwapPartOrders(ordersMap)
    })
  }, [chainId, account, twapOrders, updateTwapPartOrders])

  return null
}

async function generateTwapOrderParts(
  twapOrder: TwapOrderItem,
  safeAddress: string,
  chainId: SupportedChainId,
): Promise<{ [id: string]: TwapPartOrderItem[] }> {
  const twapOrderId = twapOrder.id

  const parts = [...new Array(twapOrder.order.n)]
    .map((_, index) => createPartOrderFromParent(twapOrder, index))
    .filter(isTruthy)

  const ids = await Promise.all(parts.map((part) => computeOrderUid(chainId, safeAddress, part as Order)))

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

function createPartOrderFromParent(twapOrder: TwapOrderItem, index: number): OrderParameters | null {
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
