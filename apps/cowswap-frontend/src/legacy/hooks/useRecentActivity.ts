import { useMemo } from 'react'

import { MAXIMUM_ORDERS_TO_DISPLAY } from '@cowprotocol/common-const'
import { getDateTimestamp } from '@cowprotocol/common-utils'
import { SupportedChainId, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAllTransactions, useTransactionsByHash } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { useCombinedPendingOrders, useOrder, useOrders, useOrdersById } from 'legacy/state/orders/hooks'

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

enum TxReceiptStatus {
  PENDING,
  CONFIRMED,
}

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
}

type UseActivityDescriptionParams = {
  chainId?: ChainId
  ids: string[]
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function createActivityDescriptor(
  chainId: SupportedChainId,
  tx?: EnhancedTransactionDetails,
  order?: Order,
): ActivityDescriptors | null {
  if (!tx && !order) return null

  let activity: EnhancedTransactionDetails | Order, type: ActivityType

  let id: string,
    isPending: boolean,
    isPresignaturePending: boolean,
    isConfirmed: boolean,
    isCancelling: boolean,
    isCancelled: boolean,
    isCreating: boolean,
    isFailed: boolean,
    date: Date

  if (!tx && order) {
    // We're dealing with an ORDER
    // setup variables accordingly...
    id = order.id

    isPresignaturePending = order.status === OrderStatus.PRESIGNATURE_PENDING // Smart contract orders only
    isCreating = order.status === OrderStatus.CREATING // EthFlow orders only
    isPending = order.status === OrderStatus.PENDING // All orders
    isConfirmed = !isPending && order.status === OrderStatus.FULFILLED
    // `order.isCancelling` is not enough to tell if the order should be shown as cancelling in the UI.
    // We can only do so if the order is in a "pending" state.
    // `isPending` is used for all orders when they are "OPEN".
    // `isCreating` is only used for EthFlow orders from the moment the tx is sent until it's received from the API.
    // After it's created in the backend the status changes to "OPEN", which ends up here as PENDING
    // Thus, we add both here to tell if the order is being cancelled
    isCancelling = (order.isCancelling || false) && (isPending || isCreating)
    isCancelled = !isConfirmed && order.status === OrderStatus.CANCELLED
    isFailed = order.status === OrderStatus.FAILED

    activity = order
    type = ActivityType.ORDER

    date = new Date(order.creationTime)
  } else if (tx) {
    // We're dealing with a TRANSACTION
    // setup variables accordingly...
    id = tx.hash

    const isReceiptConfirmed =
      !!tx.receipt && (tx.receipt.status === TxReceiptStatus.CONFIRMED || typeof tx.receipt.status === 'undefined')
    const isCancelTx = tx?.replacementType === 'cancel'
    isPending = !tx.receipt
    isPresignaturePending = false
    isConfirmed = !isPending && isReceiptConfirmed
    isCancelling = isCancelTx && isPending
    isCancelled = isCancelTx && !isPending && isReceiptConfirmed
    isCreating = false
    isFailed = !!tx.errorMessage

    activity = tx
    type = ActivityType.TX

    date = new Date(tx.addedTime)
  } else {
    // Shouldn't happen but TS is bugging me
    return null
  }

  let status

  if (isCancelling) {
    status = ActivityStatus.CANCELLING
  } else if (isFailed) {
    status = ActivityStatus.FAILED
  } else if (isPending) {
    status = ActivityStatus.PENDING
  } else if (isPresignaturePending) {
    status = ActivityStatus.PRESIGNATURE_PENDING
  } else if (isCancelled) {
    status = ActivityStatus.CANCELLED
  } else if (isConfirmed) {
    status = ActivityStatus.CONFIRMED
  } else if (isCreating) {
    status = ActivityStatus.CREATING
  } else {
    status = ActivityStatus.EXPIRED
  }
  const summary = activity.summary

  return {
    id,
    activity,
    summary,
    status,
    type,
    date,
  }
}

export function useMultipleActivityDescriptors({ chainId, ids }: UseActivityDescriptionParams): ActivityDescriptors[] {
  const txs = useTransactionsByHash({ hashes: ids })
  const orders = useOrdersById({ chainId, ids })

  return useMemo(() => {
    if (!chainId) return []

    return ids.reduce<ActivityDescriptors[]>((acc, id) => {
      const activity = createActivityDescriptor(chainId, txs[id], orders?.[id])
      if (activity) {
        acc.push(activity)
      }
      return acc
    }, [])
  }, [chainId, ids, orders, txs])
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
    return createActivityDescriptor(chainId, tx, order)
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

export function useRecentActivityLastPendingOrder(): Order | null {
  const { chainId, account } = useWalletInfo()
  const pending = useCombinedPendingOrders({ chainId, account })

  return useMemo(() => {
    if (!pending.length) {
      return null
    }
    return pending[pending.length - 1] || null

    // Disabling hook to avoid unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pending)])
}

function isNotEthFlowTx(tx: EnhancedTransactionDetails): boolean {
  return !tx.ethFlow
}

function isNotOnChainCancellationTx(tx: EnhancedTransactionDetails): boolean {
  return !tx.onChainCancellation
}
