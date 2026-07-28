import { useEffect, useState } from 'react'

import { useLatestRef } from '@cowprotocol/common-hooks'
import { logTwap, normalizeError } from '@cowprotocol/common-utils'
import {
  type EnrichedOrder,
  OrderClass,
  OrderKind,
  OrderStatus as SdkOrderStatus,
  SigningScheme,
  type UID,
} from '@cowprotocol/cow-sdk'
import type { QueryPage, TwapPartOrder, TwapPartOrderStatus } from '@cowprotocol/sdk-composable'

import { OrderStatus, type Order } from 'legacy/state/orders/actions'

import { parseOrder, type ParsedOrder } from 'utils/orderUtils/parseOrder'

import { EOA_TWAP_PARTS_PAGE_SIZE } from '../const'
import { programmaticOrdersApi } from '../services/programmaticOrdersApi'
import { type TwapOrderItem } from '../types'

interface EoaTwapPartOrdersResult {
  orders: ParsedOrder[]
  isLoading: boolean
}

export function useEoaTwapPartOrders(
  twapOrder: TwapOrderItem | null,
  parent: ParsedOrder,
  page: number,
  enabled: boolean,
): EoaTwapPartOrdersResult {
  const [result, setResult] = useState<EoaTwapPartOrdersResult>({
    orders: [],
    isLoading: false,
  })
  const partOrdersCount = twapOrder?.partOrdersCount ?? 0
  const parentRef = useLatestRef(parent)

  useEffect(() => {
    if (!enabled) return

    if (!twapOrder || partOrdersCount === 0) {
      setResult({ orders: [], isLoading: false })
      return
    }

    let isCurrent = true

    setResult({ orders: [], isLoading: true })

    programmaticOrdersApi.fetchEoaTwapPartOrders(twapOrder.id, twapOrder.chainId, page).then(
      (partPage) => {
        if (!isCurrent) return

        logTwap.debug('Fetched EOA TWAP part orders', {
          orderCount: partPage.items.length,
          page,
        })
        setResult({
          orders: mapPartOrders(partPage, twapOrder, parentRef.current, page),
          isLoading: false,
        })
      },
      (err: unknown) => {
        if (!isCurrent) return

        const error = normalizeError(err)

        logTwap.error(error, {
          chainId: String(twapOrder.chainId),
          page: String(page),
        })
        setResult({
          orders: [],
          isLoading: false,
        })
      },
    )

    return () => {
      isCurrent = false
    }
  }, [enabled, page, parentRef, partOrdersCount, twapOrder])

  return result
}

function mapPartOrder(
  partOrder: TwapPartOrder,
  twapOrder: TwapOrderItem,
  parent: ParsedOrder,
  isTheLastPart: boolean,
): ParsedOrder {
  const executedSellAmount = (partOrder.executedSellAmount ?? 0n).toString()
  const executedBuyAmount = (partOrder.executedBuyAmount ?? 0n).toString()
  const executedFeeAmount = (partOrder.executedFeeAmount ?? 0n).toString()
  const validTo = partOrder.validTo ?? Math.ceil(parent.expirationTime.getTime() / 1000)
  const creationTime = new Date(partOrder.createdAt * 1000).toISOString()
  const apiAdditionalInfo = {
    sellToken: twapOrder.order.sellToken,
    buyToken: twapOrder.order.buyToken,
    receiver: twapOrder.order.receiver,
    sellAmount: partOrder.sellAmount.toString(),
    buyAmount: partOrder.buyAmount.toString(),
    validTo,
    appData: twapOrder.order.appData,
    feeAmount: partOrder.feeAmount.toString(),
    kind: OrderKind.SELL,
    partiallyFillable: false,
    signature: '',
    signingScheme: SigningScheme.EIP1271,
    class: OrderClass.LIMIT,
    status: mapSdkPartOrderStatus(partOrder.status),
    creationDate: creationTime,
    owner: twapOrder.safeAddress,
    uid: partOrder.orderUid,
    executedSellAmount,
    executedSellAmountBeforeFees: executedSellAmount,
    executedBuyAmount,
    executedFeeAmount,
    totalFee: executedFeeAmount,
    invalidated: false,
  } satisfies Omit<EnrichedOrder, 'settlementContract'>
  const order = {
    ...apiAdditionalInfo,
    id: partOrder.orderUid as UID,
    status: mapPartOrderStatus(partOrder.status),
    creationTime,
    isEoaTwapOrder: true,
    sellAmountBeforeFee: partOrder.sellAmount.toString(),
    inputToken: parent.inputToken,
    outputToken: parent.outputToken,
    fullAppData: parent.fullAppData,
    composableCowInfo: {
      isVirtualPart: false,
      isTheLastPart,
      parentId: twapOrder.id,
    },
    apiAdditionalInfo,
  } satisfies Order

  return parseOrder(order)
}

function mapPartOrders(
  page: QueryPage<TwapPartOrder>,
  twapOrder: TwapOrderItem,
  parent: ParsedOrder,
  pageNumber: number,
): ParsedOrder[] {
  const offset = (pageNumber - 1) * EOA_TWAP_PARTS_PAGE_SIZE

  return page.items.map((partOrder, index) =>
    mapPartOrder(partOrder, twapOrder, parent, offset + index === page.totalCount - 1),
  )
}

function mapPartOrderStatus(status: TwapPartOrderStatus): OrderStatus {
  if (status === 'open') return OrderStatus.PENDING
  if (status === 'fulfilled') return OrderStatus.FULFILLED
  if (status === 'cancelled') return OrderStatus.CANCELLED

  return OrderStatus.EXPIRED
}

function mapSdkPartOrderStatus(status: TwapPartOrderStatus): SdkOrderStatus {
  if (status === 'open') return SdkOrderStatus.OPEN
  if (status === 'fulfilled') return SdkOrderStatus.FULFILLED
  if (status === 'cancelled') return SdkOrderStatus.CANCELLED

  return SdkOrderStatus.EXPIRED
}
