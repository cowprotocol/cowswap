import { useMemo } from 'react'

import { getEtherscanLink, getExplorerOrderLink } from '@cowprotocol/common-utils'
import { getSafeWebUrl } from '@cowprotocol/core'
import { useGnosisSafeInfo } from '@cowprotocol/wallet'
import { SafeInfoResponse } from '@safe-global/api-kit'

import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { ActivityDerivedState, OrderCreationTxInfo } from 'modules/account/containers/Transaction'

import { ActivityDescriptors, ActivityStatus, ActivityType } from './useRecentActivity'

import { useAllTransactions } from '../state/enhancedTransactions/hooks'

export function useActivityDerivedState({
  chainId,
  activity,
}: {
  chainId: number | undefined
  activity: ActivityDescriptors
}): ActivityDerivedState | null {
  const allTransactions = useAllTransactions()
  const gnosisSafeInfo = useGnosisSafeInfo()

  const orderCreationTxInfo: OrderCreationTxInfo | undefined = useMemo(() => {
    const isOrder = activity.type === ActivityType.ORDER
    const order = isOrder ? (activity.activity as Order) : undefined

    if (order?.orderCreationHash) {
      const orderCreationTx = allTransactions[order.orderCreationHash]
      const orderCreationLinkedTx = orderCreationTx?.linkedTransactionHash
        ? allTransactions[orderCreationTx.linkedTransactionHash]
        : undefined

      return {
        orderCreationTx,
        orderCreationLinkedTx,
      }
    }

    return undefined
  }, [allTransactions, activity])

  // Get some derived information about the activity. It helps to simplify the rendering of the subcomponents
  return useMemo(
    () => getActivityDerivedState({ chainId, activityData: activity, gnosisSafeInfo, orderCreationTxInfo }),
    [chainId, activity, gnosisSafeInfo, orderCreationTxInfo]
  )
}

export function getActivityDerivedState(props: {
  chainId?: number
  activityData: ActivityDescriptors | null
  gnosisSafeInfo?: SafeInfoResponse
  orderCreationTxInfo?: OrderCreationTxInfo
}): ActivityDerivedState | null {
  const { chainId, activityData, gnosisSafeInfo, orderCreationTxInfo } = props

  if (!activityData || chainId === undefined) {
    return null
  }

  const { id, activity, status, type, summary } = activityData
  const isTransaction = type === ActivityType.TX
  const isOrder = type === ActivityType.ORDER
  const order = isOrder ? (activity as Order) : undefined
  const enhancedTransaction = isTransaction ? (activity as EnhancedTransactionDetails) : undefined

  // Eth-flow related
  const isEthOrderCreationReplaced = orderCreationTxInfo?.orderCreationLinkedTx?.replacementType === 'replaced'
  const isEthOrderCreationCancelled = orderCreationTxInfo?.orderCreationLinkedTx?.replacementType === 'cancel'

  // Calculate some convenient status flags
  const isReplaced = enhancedTransaction?.replacementType === 'replaced' || isEthOrderCreationReplaced
  const isPending = !isReplaced && !isEthOrderCreationCancelled && status === ActivityStatus.PENDING
  const isConfirmed = !isReplaced && !isEthOrderCreationCancelled && status === ActivityStatus.CONFIRMED

  const activityLinkUrl = getActivityLinkUrl({ id, chainId, enhancedTransaction, order })

  return {
    id,
    status,
    type,
    summary,
    activityLinkUrl,

    // Convenient flags
    isTransaction,
    isOrder,
    isPending,
    isConfirmed,
    isReplaced,
    isPresignaturePending: status === ActivityStatus.PRESIGNATURE_PENDING,
    isExpired: status === ActivityStatus.EXPIRED,
    isCancelling: status === ActivityStatus.CANCELLING,
    isCancelled: !isConfirmed && (status === ActivityStatus.CANCELLED || isEthOrderCreationCancelled),
    isUnfillable: (activity as Order).isUnfillable,
    isCreating: status === ActivityStatus.CREATING,
    isFailed: status === ActivityStatus.FAILED,

    // Convenient casting
    order,
    enhancedTransaction,

    // Gnosis Safe
    gnosisSafeInfo,
  }
}

export function getActivityLinkUrl(params: {
  chainId: number
  id: string
  enhancedTransaction?: EnhancedTransactionDetails
  order?: Order
}): string | undefined {
  const { chainId, id, enhancedTransaction, order } = params

  if (enhancedTransaction) {
    const { transactionHash, hash, safeTransaction, hashType } = enhancedTransaction

    /**
     * This is a special case for Gnosis Safe transactions created via WC in a Safe with 1/1 signers
     */
    if (hashType === HashType.GNOSIS_SAFE_TX && hash) {
      return getEtherscanLink(chainId, 'transaction', hash)
    }

    if (transactionHash) {
      // It's an Ethereum transaction: Etherscan link
      return getEtherscanLink(chainId, 'transaction', transactionHash)
    } else if (safeTransaction && safeTransaction) {
      // It's a safe transaction: Gnosis Safe Web link
      const { safe, safeTxHash } = safeTransaction
      return getSafeWebUrl(chainId, safe, safeTxHash) ?? undefined
    }
  } else if (order) {
    if (order.orderCreationHash && (order.status === OrderStatus.CREATING || order.status === OrderStatus.FAILED)) {
      // It's a EthFlow transaction: Etherscan link
      return getEtherscanLink(chainId, 'transaction', order.orderCreationHash)
    } else {
      // It's an order: GP Explorer link
      return getExplorerOrderLink(chainId, id)
    }
  }

  return undefined
}

type ActivityState =
  | 'open'
  | 'filled'
  | 'executed'
  | 'expired'
  | 'failed'
  | 'cancelled'
  | 'pending'
  | 'signing'
  | 'cancelling'
  | 'creating'

export function getActivityState({
  isPending,
  isOrder,
  isConfirmed,
  isExpired,
  isCancelling,
  isPresignaturePending,
  isCancelled,
  isCreating,
  isFailed,
  enhancedTransaction,
}: ActivityDerivedState): ActivityState {
  if (isPending) {
    if (enhancedTransaction) {
      const { safeTransaction, transactionHash } = enhancedTransaction
      if (safeTransaction && !transactionHash) {
        return 'signing'
      }
    }

    return isOrder ? 'open' : 'pending'
  }

  if (isConfirmed) {
    return isOrder ? 'filled' : 'executed'
  }

  if (isExpired) {
    return isOrder ? 'expired' : 'failed'
  }

  if (isCancelling) {
    return 'cancelling'
  }

  if (isPresignaturePending) {
    return 'signing'
  }

  if (isCancelled) {
    return 'cancelled'
  }

  if (isCreating) {
    return 'creating'
  }

  if (isFailed) {
    return 'failed'
  }

  return 'open'
}
