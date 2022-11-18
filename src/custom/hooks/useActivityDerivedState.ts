import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import { useMemo } from 'react'
import { getSafeWebUrl } from '@cow/api/gnosisSafe'
import { ActivityDerivedState } from 'components/AccountDetails/Transaction'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'state/orders/actions'
import { getEtherscanLink } from 'utils'
import { getExplorerOrderLink } from 'utils/explorer'
import { ActivityDescriptors, ActivityStatus, ActivityType } from 'hooks/useRecentActivity'
import { useWalletInfo } from 'hooks/useWalletInfo'

export function useActivityDerivedState({
  chainId,
  activity,
}: {
  chainId: number | undefined
  activity: ActivityDescriptors
}): ActivityDerivedState | null {
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()

  // Get some derived information about the activity. It helps to simplify the rendering of the sub-components
  return useMemo(
    () => getActivityDerivedState({ chainId, activityData: activity, allowsOffchainSigning, gnosisSafeInfo }),
    [chainId, activity, allowsOffchainSigning, gnosisSafeInfo]
  )
}

function getActivityDerivedState(props: {
  chainId?: number
  activityData: ActivityDescriptors | null
  allowsOffchainSigning: boolean
  gnosisSafeInfo?: SafeInfoResponse
}): ActivityDerivedState | null {
  const { chainId, activityData, allowsOffchainSigning, gnosisSafeInfo } = props
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
  const isCancellable = allowsOffchainSigning && isPending && isOrder

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
    isPresignaturePending: status === ActivityStatus.PRESIGNATURE_PENDING,
    isConfirmed: status === ActivityStatus.CONFIRMED,
    isExpired: status === ActivityStatus.EXPIRED,
    isCancelling: status === ActivityStatus.CANCELLING,
    isCancelled: status === ActivityStatus.CANCELLED,
    isCancellable,
    isUnfillable: isCancellable && (activity as Order).isUnfillable,
    isCreating: status === ActivityStatus.CREATING,
    isRefunding: false, // TODO: wire up refunding/refunded states
    isRefunded: order?.isRefunded || false,

    // Convenient casting
    order,
    enhancedTransaction,

    // Gnosis Safe
    gnosisSafeInfo,
  }
}

function getActivityLinkUrl(params: {
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
      const { safe } = safeTransaction
      return getSafeWebUrl(chainId, safe) ?? undefined
    }
  } else if (order) {
    if (order.orderCreationHash && order.status === OrderStatus.CREATING) {
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
  | 'refunding'
  | 'refunded'

export function getActivityState({
  isPending,
  isOrder,
  isConfirmed,
  isExpired,
  isCancelling,
  isPresignaturePending,
  isCancelled,
  isCreating,
  isRefunding,
  isRefunded,
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

  if (isRefunding) {
    return 'refunding'
  }

  if (isRefunded) {
    return 'refunded'
  }

  return 'open'
}
