import { useMemo } from 'react'

import { MAXIMUM_ORDERS_TO_DISPLAY } from '@cowprotocol/common-const'
import { getDateTimestamp } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAllTransactions, useTransactionsByHash } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { useOrder, useOrders, useOrdersById } from 'legacy/state/orders/hooks'

import { OrderFillability, usePendingOrdersFillability } from 'modules/ordersTable'

import { ActivityStatus, ActivityType } from 'common/types/activity'

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
function isTransactionRecent(tx: EnhancedTransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

export interface AddedOrder extends Order {
  addedTime: number
}

export type TransactionAndOrder =
  | AddedOrder
  | (EnhancedTransactionDetails & {
      id: string
      status: OrderStatus
    })

/**
 * useRecentActivity
 * @description returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
 */
export function useRecentActivity(): TransactionAndOrder[] {
  const { chainId, account } = useWalletInfo()
  const allTransactions = useAllTransactions()
  const allNonEmptyOrders = useOrders(chainId, account, UiOrderType.SWAP)

  const recentOrdersAdjusted = useMemo<TransactionAndOrder[]>(() => {
    return (
      allNonEmptyOrders
        .map((order) =>
          // we need to essentially match TransactionDetails type which uses "addedTime" for date checking
          // and time in MS vs ISO string as Orders uses
          ({
            ...order,
            addedTime: Date.parse(order.creationTime),
          }),
        )
        // sort orders by calculated `addedTime` descending
        .sort((a, b) => b.addedTime - a.addedTime)
        // show at most MAXIMUM_ORDERS_TO_DISPLAY regular orders, and as much pending as there are
        .filter((order, index) => index < MAXIMUM_ORDERS_TO_DISPLAY || order.status === OrderStatus.PENDING)
    )
  }, [allNonEmptyOrders])

  const recentTransactionsAdjusted = useMemo<TransactionAndOrder[]>(() => {
    if (!account) {
      return []
    }

    const accountLowerCase = account.toLowerCase()

    return (
      Object.values(allTransactions)
        // Only show orders for connected account
        .filter((tx) => {
          return (
            tx.from.toLowerCase() === accountLowerCase &&
            isTransactionRecent(tx) &&
            isNotEthFlowTx(tx) &&
            isNotOnChainCancellationTx(tx)
          )
        })
        .map((tx) => {
          return {
            ...tx,
            // we need to adjust Transaction object and add "id" + "status" to match Orders type
            id: tx.hash,
            status: tx.receipt ? OrderStatus.FULFILLED : tx.errorMessage ? OrderStatus.FAILED : OrderStatus.PENDING,
          }
        })
    )
  }, [account, allTransactions])

  return useMemo(
    () =>
      // Concat together the EnhancedTransactionDetails[] and Orders[]
      // then sort them by newest first
      recentTransactionsAdjusted.concat(recentOrdersAdjusted).sort((a, b) => b.addedTime - a.addedTime),
    [recentOrdersAdjusted, recentTransactionsAdjusted],
  )
}

export interface ActivityDescriptors {
  id: string
  activity: EnhancedTransactionDetails | Order
  summary?: string
  status: ActivityStatus
  type: ActivityType
  date: Date
  fillability?: OrderFillability
}

type UseActivityDescriptionParams = {
  chainId?: ChainId
  ids: string[]
}

export function createActivityDescriptor(
  tx?: EnhancedTransactionDetails,
  order?: Order,
  orderFillability?: OrderFillability,
): ActivityDescriptors | null {
  if (!tx && !order) return null

  if (order) {
    return {
      id: order.id,
      activity: order,
      status: getOrderActivityStatus(order),
      type: ActivityType.ORDER,
      date: new Date(order.creationTime),
      fillability: orderFillability,
    }
  }

  if (tx) {
    return {
      id: tx.hash,
      activity: tx,
      summary: tx.summary,
      status: getTxActivityStatus(tx),
      type: ActivityType.TX,
      date: new Date(tx.addedTime),
      fillability: orderFillability,
    }
  }

  return null
}

function getOrderActivityStatus(order: Order): ActivityStatus {
  const isPresignaturePending = order.status === OrderStatus.PRESIGNATURE_PENDING // Smart contract orders only
  const isCreating = order.status === OrderStatus.CREATING // EthFlow orders only
  const isPending = order.status === OrderStatus.PENDING // All orders
  const isConfirmed = !isPending && order.status === OrderStatus.FULFILLED
  // `order.isCancelling` is not enough to tell if the order should be shown as cancelling in the UI.
  // We can only do so if the order is in a "pending" state.
  // `isPending` is used for all orders when they are "OPEN".
  // `isCreating` is only used for EthFlow orders from the moment the tx is sent until it's received from the API.
  // After it's created in the backend the status changes to "OPEN", which ends up here as PENDING
  // Thus, we add both here to tell if the order is being cancelled
  const isCancelling = getIsOrderCancelling(order)
  const isCancelled = !isConfirmed && order.status === OrderStatus.CANCELLED
  const isFailed = order.status === OrderStatus.FAILED

  if (isCancelling) return ActivityStatus.CANCELLING
  if (isFailed) return ActivityStatus.FAILED
  if (isPending) return ActivityStatus.PENDING
  if (isPresignaturePending) return ActivityStatus.PRESIGNATURE_PENDING
  if (isCancelled) return ActivityStatus.CANCELLED
  if (isConfirmed) return ActivityStatus.CONFIRMED
  if (isCreating) return ActivityStatus.CREATING

  return ActivityStatus.EXPIRED
}

/**
 * `order.isCancelling` is not enough to tell if the order should be shown as cancelling in the UI.
 * We can only do so if the order is in a "pending" state.
 * `isPending` is used for all orders when they are "OPEN".
 * `isCreating` is only used for EthFlow orders from the moment the tx is sent until it's received from the API.
 * After it's created in the backend the status changes to "OPEN", which ends up here as PENDING
 * Thus, we add both here to tell if the order is being cancelled
 */
function getIsOrderCancelling(order: Order): boolean {
  return (order.isCancelling || false) && [OrderStatus.CREATING, OrderStatus.PENDING].includes(order.status)
}

function getTxActivityStatus(tx: EnhancedTransactionDetails): ActivityStatus {
  const isReceiptConfirmed = getIsReceiptConfirmed(tx)
  const isCancelTx = tx.replacementType === 'cancel'
  const isPending = !tx.receipt
  const isConfirmed = !isPending && isReceiptConfirmed
  const isCancelling = isCancelTx && isPending
  const isCancelled = isCancelTx && !isPending && isReceiptConfirmed
  const isFailed = !!tx.errorMessage

  if (isCancelling) return ActivityStatus.CANCELLING
  if (isFailed) return ActivityStatus.FAILED
  if (isPending) return ActivityStatus.PENDING
  if (isCancelled) return ActivityStatus.CANCELLED
  if (isConfirmed) return ActivityStatus.CONFIRMED

  return ActivityStatus.EXPIRED
}

function getIsReceiptConfirmed(tx: EnhancedTransactionDetails): boolean {
  return tx.receipt?.status === 'success' || typeof tx.receipt?.status === 'undefined'
}

export function useMultipleActivityDescriptors({ chainId, ids }: UseActivityDescriptionParams): ActivityDescriptors[] {
  const txs = useTransactionsByHash({ hashes: ids })
  const orders = useOrdersById({ chainId, ids })
  const pendingOrdersFillability = usePendingOrdersFillability()

  return useMemo(() => {
    return ids.reduce<ActivityDescriptors[]>((acc, id) => {
      const activity = createActivityDescriptor(txs[id], orders?.[id], pendingOrdersFillability[id])
      if (activity) {
        acc.push(activity)
      }
      return acc
    }, [])
  }, [ids, orders, txs, pendingOrdersFillability])
}

export function useSingleActivityDescriptor({
  chainId,
  id,
}: {
  chainId?: ChainId
  id?: string
}): ActivityDescriptors | null {
  const allTransactions = useAllTransactions()
  const order = useOrder({ id, chainId })

  const tx = id ? allTransactions?.[id] : undefined

  return useMemo(() => {
    if (!chainId) return null
    return createActivityDescriptor(tx, order)
  }, [chainId, order, tx])
}

type ActivitiesGroupedByDate = {
  date: Date
  activities: ActivityDescriptors[]
}[]

/**
 * Helper function that groups a list of activities by day
 * To be used on the return of `useMultipleActivityDescriptors`
 *
 * @param activities
 */
export function groupActivitiesByDay(activities: ActivityDescriptors[]): ActivitiesGroupedByDate {
  const mapByTimestamp: { [timestamp: number]: ActivityDescriptors[] } = {}

  activities.forEach((activity) => {
    const { date } = activity

    const timestamp = getDateTimestamp(date)

    mapByTimestamp[timestamp] = (mapByTimestamp[timestamp] || []).concat(activity)
  })

  return Object.keys(mapByTimestamp).map((strTimestamp) => {
    // Keys are always string, convert back to number
    const timestamp = Number(strTimestamp)
    // For easier handling later, transform into a list of objects with nested lists
    return { date: new Date(timestamp), activities: mapByTimestamp[timestamp] }
  })
}

function isNotEthFlowTx(tx: EnhancedTransactionDetails): boolean {
  return !tx.ethFlow
}

function isNotOnChainCancellationTx(tx: EnhancedTransactionDetails): boolean {
  return !tx.onChainCancellation
}
