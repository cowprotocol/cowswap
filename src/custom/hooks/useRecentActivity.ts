import { useMemo } from 'react'
import { isTransactionRecent, useAllTransactions, useTransactionsByHash } from 'state/enhancedTransactions/hooks'
import { useOrder, useOrders, useOrdersById, usePendingOrders } from 'state/orders/hooks'
import { useWeb3React } from '@web3-react/core'
import { Order, OrderStatus } from 'state/orders/actions'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { SupportedChainId as ChainId } from 'constants/chains'
import { getDateTimestamp } from '@cow/utils/time'
import { MAXIMUM_ORDERS_TO_DISPLAY } from 'constants/index'

export interface AddedOrder extends Order {
  addedTime: number
}
export type TransactionAndOrder =
  | AddedOrder
  | (EnhancedTransactionDetails & {
      id: string
      status: OrderStatus
    })

export enum ActivityType {
  ORDER = 'order',
  TX = 'tx',
}

export enum ActivityStatus {
  PENDING,
  PRESIGNATURE_PENDING,
  CONFIRMED,
  EXPIRED,
  CANCELLING,
  CANCELLED,
  CREATING,
  FAILED,
}

enum TxReceiptStatus {
  PENDING,
  CONFIRMED,
}

/**
 * useRecentActivity
 * @description returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
 */
export default function useRecentActivity() {
  const { chainId, account } = useWeb3React()
  const allTransactions = useAllTransactions()
  const allNonEmptyOrders = useOrders({ chainId })

  const recentOrdersAdjusted = useMemo<TransactionAndOrder[]>(() => {
    if (!chainId || !account) {
      return []
    }

    const accountLowerCase = account.toLowerCase()

    return (
      allNonEmptyOrders
        // only show orders for connected account
        .filter((order) => order.owner.toLowerCase() === accountLowerCase)
        .map((order) =>
          // we need to essentially match TransactionDetails type which uses "addedTime" for date checking
          // and time in MS vs ISO string as Orders uses
          ({
            ...order,
            addedTime: Date.parse(order.creationTime),
          })
        )
        // sort orders by calculated `addedTime` descending
        .sort((a, b) => b.addedTime - a.addedTime)
        // show at most MAXIMUM_ORDERS_TO_DISPLAY regular orders, and as much pending as there are
        .filter((order, index) => index < MAXIMUM_ORDERS_TO_DISPLAY || order.status === OrderStatus.PENDING)
    )
  }, [account, allNonEmptyOrders, chainId])

  const recentTransactionsAdjusted = useMemo<TransactionAndOrder[]>(() => {
    if (!account) {
      return []
    }

    const accountLowerCase = account.toLowerCase()

    return (
      Object.values(allTransactions)
        // Only show orders for connected account
        .filter((tx) => tx.from.toLowerCase() === accountLowerCase)
        // Only recent transactions
        .filter(isTransactionRecent)
        .map((tx) => ({
          ...tx,
          // we need to adjust Transaction object and add "id" + "status" to match Orders type
          id: tx.hash,
          status: tx.receipt ? OrderStatus.FULFILLED : OrderStatus.PENDING,
        }))
    )
  }, [account, allTransactions])

  return useMemo(
    () =>
      // Concat together the EnhancedTransactionDetails[] and Orders[]
      // then sort them by newest first
      recentTransactionsAdjusted.concat(recentOrdersAdjusted).sort((a, b) => b.addedTime - a.addedTime),
    [recentOrdersAdjusted, recentTransactionsAdjusted]
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

function createActivityDescriptor(tx?: EnhancedTransactionDetails, order?: Order): ActivityDescriptors | null {
  if (!tx && !order) return null

  let activity: EnhancedTransactionDetails | Order, type: ActivityType

  let id: string,
    isPending: boolean,
    isPresignaturePending: boolean,
    isConfirmed: boolean,
    isCancelling: boolean,
    isCancelled: boolean,
    isCreating: boolean,
    isRefunding: boolean,
    isRefunded: boolean,
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
    isRefunding = false // TODO: wire up refunding state
    isRefunded = order.isRefunded || false

    activity = order
    type = ActivityType.ORDER

    date = new Date(order.creationTime)
  } else if (tx) {
    // We're dealing with a TRANSACTION
    // setup variables accordingly...
    id = tx.hash

    const isReceiptConfirmed =
      tx.receipt?.status === TxReceiptStatus.CONFIRMED || typeof tx.receipt?.status === 'undefined'
    const isCancelTx = tx?.replacementType === 'cancel'
    isPending = !tx.receipt
    isPresignaturePending = false
    isConfirmed = !isPending && isReceiptConfirmed
    isCancelling = isCancelTx && isPending
    isCancelled = isCancelTx && !isPending && isReceiptConfirmed
    isCreating = false // TODO: the creation is a tx, but we should do an order. Likely wouldn't need to handle it here
    isRefunding = false
    isRefunded = false

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
  } else if (isRefunding) {
    status = ActivityStatus.EXPIRED
  } else if (isRefunded) {
    status = ActivityStatus.EXPIRED
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

export function useMultipleActivityDescriptors({
  chainId,
  ids,
}: UseActivityDescriptionParams): ActivityDescriptors[] | null {
  const txs = useTransactionsByHash({ hashes: ids })
  const orders = useOrdersById({ chainId, ids })

  return useMemo(() => {
    if (!chainId) return null

    return ids.reduce<ActivityDescriptors[]>((acc, id) => {
      const activity = createActivityDescriptor(txs[id], orders[id])
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

export function useRecentActivityLastPendingOrder() {
  const { chainId } = useWeb3React()
  const pending = usePendingOrders({ chainId })

  return useMemo(() => {
    if (!pending.length) {
      return null
    }
    return pending[pending.length - 1] || null

    // Disabling hook to avoid unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pending)])
}
