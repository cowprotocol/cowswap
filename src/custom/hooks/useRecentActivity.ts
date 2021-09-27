import { useMemo } from 'react'
import { isTransactionRecent, useAllTransactions, useTransactionsByHash } from 'state/enhancedTransactions/hooks'
import { useOrder, useOrders, useOrdersById } from 'state/orders/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { Order, OrderStatus } from 'state/orders/actions'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { SupportedChainId as ChainId } from 'constants/chains'
import { getDateTimestamp } from 'utils/time'

export type TransactionAndOrder =
  | (Order & { addedTime: number })
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
}

enum TxReceiptStatus {
  PENDING,
  CONFIRMED,
}

function sortByDate(a: Order, b: Order): number {
  const dateA = new Date(a.creationTime)
  const dateB = new Date(b.creationTime)

  return dateA > dateB ? -1 : dateA < dateB ? 1 : 0
}

/**
 * useRecentActivity
 * @description returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
 */
export default function useRecentActivity() {
  const { chainId, account } = useActiveWeb3React()
  const allTransactions = useAllTransactions()
  const allNonEmptyOrders = useOrders({ chainId })

  const recentOrdersAdjusted = useMemo<TransactionAndOrder[]>(() => {
    if (!chainId || !account) {
      return []
    }
    return (
      allNonEmptyOrders
        // only show orders for connected account
        .filter((order) => order.owner.toLowerCase() === account.toLowerCase())
        .map((order) =>
          // we need to essentially match TransactionDetails type which uses "addedTime" for date checking
          // and time in MS vs ISO string as Orders uses
          ({
            ...order,
            addedTime: Date.parse(order.creationTime),
          })
        )
        .sort(sortByDate)
        // show at most 10 regular orders, and as much pending as there are
        .filter((order, index) => index < 10 || order.status === OrderStatus.PENDING)
    )
  }, [account, allNonEmptyOrders, chainId])

  const recentTransactionsAdjusted = useMemo<TransactionAndOrder[]>(
    () =>
      // Filter out any pending/fulfilled transactions OLDER than 1 day
      // and adjust order object to match Order id + status format
      // which is used later in app to render list of activity
      Object.values(allTransactions)
        .filter(isTransactionRecent)
        .filter((tx) => tx.from === account)
        .map((tx) => ({
          ...tx,
          // we need to adjust Transaction object and add "id" + "status" to match Orders type
          id: tx.hash,
          status: tx.receipt ? OrderStatus.FULFILLED : OrderStatus.PENDING,
        })),
    [account, allTransactions]
  )

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
    date: Date

  if (!tx && order) {
    // We're dealing with an ORDER
    // setup variables accordingly...
    id = order.id

    isPending = order?.status === OrderStatus.PENDING
    isPresignaturePending = order?.status === OrderStatus.PRESIGNATURE_PENDING
    isConfirmed = !isPending && order?.status === OrderStatus.FULFILLED
    isCancelling = (order.isCancelling || false) && isPending
    isCancelled = !isConfirmed && order?.status === OrderStatus.CANCELLED

    activity = order
    type = ActivityType.ORDER

    date = new Date(order?.creationTime)
  } else if (tx) {
    // We're dealing with a TRANSACTION
    // setup variables accordingly...
    id = tx.hash

    const isReceiptConfirmed =
      tx.receipt?.status === TxReceiptStatus.CONFIRMED || typeof tx.receipt?.status === 'undefined'
    isPending = !tx.receipt
    isPresignaturePending = false
    isConfirmed = !isPending && isReceiptConfirmed
    // TODO: can't tell when it's cancelled from the network yet
    isCancelling = false
    isCancelled = false

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
  } else if (isConfirmed) {
    status = ActivityStatus.CONFIRMED
  } else if (isCancelled) {
    status = ActivityStatus.CANCELLED
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
  id: string
}): ActivityDescriptors | null {
  const allTransactions = useAllTransactions()
  const order = useOrder({ id, chainId })

  const tx = allTransactions?.[id]

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
