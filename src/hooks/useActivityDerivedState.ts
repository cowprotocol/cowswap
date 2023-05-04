import { SafeInfoResponse } from '@safe-global/api-kit'
import { useMemo } from 'react'
import { getSafeWebUrl } from '@cow/api/gnosisSafe'
import { ActivityDerivedState } from '@cow/modules/account/containers/Transaction'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'state/orders/actions'
import { getEtherscanLink } from 'utils'
import { getExplorerOrderLink } from 'utils/explorer'
import { ActivityDescriptors, ActivityStatus, ActivityType } from 'hooks/useRecentActivity'
import { useGnosisSafeInfo } from '@cow/modules/wallet'

export function useActivityDerivedState({
  chainId,
  activity,
}: {
  chainId: number | undefined
  activity: ActivityDescriptors
}): ActivityDerivedState | null {
  const gnosisSafeInfo = useGnosisSafeInfo()

  // Get some derived information about the activity. It helps to simplify the rendering of the subcomponents
  return useMemo(
    () => getActivityDerivedState({ chainId, activityData: activity, gnosisSafeInfo }),
    [chainId, activity, gnosisSafeInfo]
  )
}

function getActivityDerivedState(props: {
  chainId?: number
  activityData: ActivityDescriptors | null
  gnosisSafeInfo?: SafeInfoResponse
}): ActivityDerivedState | null {
  const { chainId, activityData, gnosisSafeInfo } = props
  if (!activityData || chainId === undefined) {
    return null
  }

  const { id, activity, status, type, summary } = activityData
  const isTransaction = type === ActivityType.TX
  const isOrder = type === ActivityType.ORDER
  const order = isOrder ? (activity as Order) : undefined
  const enhancedTransaction = isTransaction ? (activity as EnhancedTransactionDetails) : undefined

  // Calculate some convenient status flags
  const isPending = status === ActivityStatus.PENDING
  const isConfirmed = status === ActivityStatus.CONFIRMED

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
    isPresignaturePending: status === ActivityStatus.PRESIGNATURE_PENDING,
    isExpired: status === ActivityStatus.EXPIRED,
    isCancelling: status === ActivityStatus.CANCELLING,
    isCancelled: !isConfirmed && status === ActivityStatus.CANCELLED,
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
    const { transactionHash, safeTransaction } = enhancedTransaction

    if (transactionHash) {
      // It's an Ethereum transaction: Etherscan link
      return getEtherscanLink(chainId, transactionHash, 'transaction')
    } else if (safeTransaction && safeTransaction) {
      // It's a safe transaction: Gnosis Safe Web link
      const { safe, safeTxHash } = safeTransaction
      return getSafeWebUrl(chainId, safe, safeTxHash) ?? undefined
    }
  } else if (order) {
    if (order.orderCreationHash && (order.status === OrderStatus.CREATING || order.status === OrderStatus.FAILED)) {
      // It's a EthFlow transaction: Etherscan link
      return getEtherscanLink(chainId, order.orderCreationHash, 'transaction')
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
      console.log('enhancedTransaction', enhancedTransaction)
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
