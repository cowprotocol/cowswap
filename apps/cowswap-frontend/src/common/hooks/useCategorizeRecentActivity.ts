import { useMemo } from 'react'

import { UiOrderType } from '@cowprotocol/types'

import { AddedOrder, TransactionAndOrder, useRecentActivity } from 'legacy/hooks/useRecentActivity'
import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { CREATING_STATES, Order, OrderStatus, PENDING_STATES } from 'legacy/state/orders/actions'

import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const isPending = ({ status, replacementType }: { status: OrderStatus; replacementType?: string }) => {
  if (replacementType === 'replaced') return false

  return PENDING_STATES.includes(status)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const isCreating = ({ status }: { status: OrderStatus }) => CREATING_STATES.includes(status)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCategorizeRecentActivity() {
  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const allRecentActivity = useRecentActivity()
  const allTransactions = useAllTransactions()

  const [pendingActivity, confirmedActivity] = useMemo(() => {
    // Separate the array into 2: transitory (pending) and final (confirmed) states
    return allRecentActivity.reduce<[string[], string[]]>(
      (acc, activity) => {
        // Only display regular on-chain transactions (wrap, approval, etc) OR MARKET orders
        if (!activity.class || getUiOrderType(activity as Order) === UiOrderType.SWAP) {
          if (isEthFlowOrderNotCreated(allTransactions, activity)) {
            acc[1].push(activity.id)
          } else if (isPending(activity)) {
            acc[0].push(activity.id)
          } else if (getIsFinalizedOrder(activity)) {
            acc[1].push(activity.id)
          }
        }
        return acc
      },
      [[], []]
    )
  }, [allRecentActivity, allTransactions])
  return useMemo(() => ({ pendingActivity, confirmedActivity }), [pendingActivity, confirmedActivity])
}

function isEthFlowOrderNotCreated(
  transactions: ReturnType<typeof useAllTransactions>,
  activity: TransactionAndOrder
): boolean {
  const order = activity as AddedOrder

  if (!order?.orderCreationHash) return false

  const orderCreationTx = transactions[order.orderCreationHash]
  const orderCreationLinkedTx = orderCreationTx?.linkedTransactionHash
    ? transactions[orderCreationTx.linkedTransactionHash]
    : undefined

  if (orderCreationLinkedTx) {
    return orderCreationLinkedTx.replacementType === 'replaced' || orderCreationLinkedTx.replacementType === 'cancel'
  }

  return false
}
