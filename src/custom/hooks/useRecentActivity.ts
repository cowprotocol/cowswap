import { useMemo } from 'react'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { useAllOrders, useOrders } from 'state/orders/hooks'
import { useActiveWeb3React } from 'hooks'
import { Order, OrderStatus } from 'state/orders/actions'
import { TransactionDetails } from 'state/transactions/reducer'

type TransactionAndOrder =
  | (Order & { addedTime: number })
  | (TransactionDetails & {
      id: string
      status: OrderStatus
    })

export enum ActivityType {
  ORDER = 'order',
  TX = 'tx'
}

enum TxReceiptStatus {
  PENDING,
  CONFIRMED
}

// One FULL day in MS (milliseconds not Microsoft)
const DAY_MS = 86_400_000

/**
 * Returns whether a order happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param order
 */
function isOrderRecent(order: Order): boolean {
  return Date.now() - Date.parse(order.creationTime) < DAY_MS
}

function isPending(data: TransactionAndOrder) {
  return data.status === OrderStatus.PENDING
}

function isFulfilled(data: TransactionAndOrder) {
  return data.status === OrderStatus.FULFILLED
}

/**
 * useRecentActivity
 * @description returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
 */
export default function useRecentActivity() {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()
  const allNonEmptyOrders = useOrders({ chainId })

  const recentOrdersAdjusted = useMemo<TransactionAndOrder[]>(() => {
    // Filter out any pending/fulfilled orders OLDER than 1 day
    // and adjust order object to match TransactionDetail addedTime format
    // which is used later in app to render list of activity
    const adjustedOrders = allNonEmptyOrders.filter(isOrderRecent).map(order => {
      // we need to essentially match TransactionDetails type which uses "addedTime" for date checking
      // and time in MS vs ISO string as Orders uses
      return {
        ...order,
        addedTime: Date.parse(order.creationTime)
      }
    })

    return adjustedOrders
  }, [allNonEmptyOrders])

  const recentTransactionsAdjusted = useMemo<TransactionAndOrder[]>(() => {
    // Filter out any pending/fulfilled transactions OLDER than 1 day
    // and adjust order object to match Order id + status format
    // which is used later in app to render list of activity
    const adjustedTransactions = Object.values(allTransactions)
      .filter(isTransactionRecent)
      .map(tx => {
        return {
          ...tx,
          // we need to adjust Transaction object and add "id" + "status" to match Orders type
          id: tx.hash,
          status: tx.receipt ? OrderStatus.FULFILLED : OrderStatus.PENDING
        }
      })

    return adjustedTransactions
  }, [allTransactions])

  return useMemo(() => {
    // Concat together the TransactionDetails[] and Orders[]
    // then sort them by newest first
    const sortedTransactionsAndOrders = recentTransactionsAdjusted.concat(recentOrdersAdjusted).sort((a, b) => {
      return b.addedTime - a.addedTime
    })

    // Separate the array into 2: PENDING and FULFILLED(or CONFIRMED)
    const pendingActivity = sortedTransactionsAndOrders.filter(isPending).map(data => data.id)
    const confirmedActivity = sortedTransactionsAndOrders.filter(isFulfilled).map(data => data.id)

    return {
      pendingActivity,
      confirmedActivity
    }
  }, [recentOrdersAdjusted, recentTransactionsAdjusted])
}

export function useActivityDescriptors({ chainId, id }: { chainId?: number; id: string }) {
  const allTransactions = useAllTransactions()
  const allOrders = useAllOrders({ chainId })

  const tx = allTransactions?.[id]
  const order = allOrders?.[id]?.order

  return useMemo(() => {
    if ((!tx && !order) || !chainId) return null

    let activity: TransactionDetails | Order, summary, pending, success, type: ActivityType

    if (!tx && order) {
      activity = order
      summary = activity?.summary
      pending = activity?.status === OrderStatus.PENDING
      success = !pending && activity?.status === OrderStatus.FULFILLED
      type = ActivityType.ORDER
    } else {
      const isReceiptConfirmed =
        tx.receipt?.status === TxReceiptStatus.CONFIRMED || typeof tx.receipt?.status === 'undefined'
      activity = tx
      summary = tx?.summary
      pending = !tx?.receipt
      success = !pending && isReceiptConfirmed
      type = ActivityType.TX
    }

    return {
      activity,
      summary,
      pending,
      success,
      type
    }
  }, [chainId, order, tx])
}
