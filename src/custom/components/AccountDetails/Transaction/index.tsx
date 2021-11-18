import React, { useMemo } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { getEtherscanLink } from 'utils'
import { RowFixed } from 'components/Row'

import { TransactionStatusText as ActivityDetailsText, TransactionWrapper, Wrapper } from './styled'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { getSafeWebUrl } from 'api/gnosisSafe'
import { getExplorerOrderLink } from 'utils/explorer'
import { ActivityDescriptors, ActivityStatus, ActivityType } from 'hooks/useRecentActivity'

import { ActivityDetails } from './ActivityDetails'

import { StatusDetails } from './StatusDetails'
// import { StateIcon } from './StateIcon'
import { Order } from 'state/orders/actions'
import { SafeInfoResponse, SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'

const PILL_COLOUR_MAP = {
  CONFIRMED: 'success',
  PENDING_ORDER: 'pending',
  PRESIGNATURE_PENDING: 'pending',
  PENDING_TX: 'pending',
  EXPIRED_ORDER: 'attention',
  CANCELLED_ORDER: 'attention',
  CANCELLING_ORDER: 'attention',
}

export function determinePillColour(status: ActivityStatus, type: ActivityType) {
  const isOrder = type === ActivityType.ORDER

  switch (status) {
    case ActivityStatus.PENDING:
      return isOrder ? PILL_COLOUR_MAP.PENDING_ORDER : PILL_COLOUR_MAP.PENDING_TX
    case ActivityStatus.PRESIGNATURE_PENDING:
      return PILL_COLOUR_MAP.PRESIGNATURE_PENDING
    case ActivityStatus.CONFIRMED:
      return PILL_COLOUR_MAP.CONFIRMED
    case ActivityStatus.EXPIRED:
      return PILL_COLOUR_MAP.EXPIRED_ORDER
    case ActivityStatus.CANCELLING:
      return PILL_COLOUR_MAP.CANCELLING_ORDER
    case ActivityStatus.CANCELLED:
      return PILL_COLOUR_MAP.CANCELLED_ORDER
  }
}

/**
 * Object derived from the activity state
 */
export interface ActivityDerivedState {
  id: string
  status: ActivityStatus
  type: ActivityType
  summary?: string
  activityLinkUrl?: string

  // Convenient flags
  isTransaction: boolean
  isOrder: boolean
  isPending: boolean
  isConfirmed: boolean
  isExpired: boolean
  isCancelling: boolean
  isCancelled: boolean
  isPresignaturePending: boolean
  isUnfillable?: boolean
  isCancellable: boolean
  isRejected: boolean

  // Possible activity types
  enhancedTransaction?: EnhancedTransactionDetails
  order?: Order

  // Gnosis Safe
  gnosisSafeInfo?: SafeInfoResponse
  gnosisSafeTransaction?: SafeMultisigTransactionResponse
  gnosisSafeOldNonce?: boolean
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
      // Is an Ethereum transaction: Etherscan link
      return getEtherscanLink(chainId, transactionHash, 'transaction')
    } else if (safeTransaction && safeTransaction) {
      // Its a safe transaction: Gnosis Safe Web link
      const { safe, isExecuted } = safeTransaction
      const isPending = !isExecuted
      return getSafeWebUrl(chainId, safe, isPending) ?? undefined
    }
  } else if (order) {
    // Its an order: GP Explorer link
    return getExplorerOrderLink(chainId, id)
  }

  return undefined
}

function getActivityDerivedState(props: {
  chainId?: number
  activityData: ActivityDescriptors | null
  allowsOffchainSigning: boolean
  gnosisSafeInfo?: SafeInfoResponse
}): ActivityDerivedState | null {
  const { chainId, activityData, allowsOffchainSigning, gnosisSafeInfo } = props
  if (activityData === null || chainId === undefined) {
    return null
  }

  const { id, activity, status, type, summary } = activityData
  const isTransaction = type === ActivityType.TX
  const isOrder = type === ActivityType.ORDER
  const order = isOrder ? (activity as Order) : undefined
  const enhancedTransaction = isTransaction ? (activity as EnhancedTransactionDetails) : undefined

  // Gnosis Safe
  const gnosisSafeTransaction = enhancedTransaction?.safeTransaction || order?.presignGnosisSafeTx
  let gnosisSafeOldNonce: boolean | undefined
  if (gnosisSafeTransaction && gnosisSafeInfo) {
    const { nonce: txNonce } = gnosisSafeTransaction
    const { nonce: safeNonce } = gnosisSafeInfo
    gnosisSafeOldNonce = safeNonce > txNonce
  }

  // Calculate some convenient status flags
  const isRejected = !!enhancedTransaction?.rejectedTime || gnosisSafeOldNonce === true
  const isPending = status === ActivityStatus.PENDING && !isRejected
  const isCancellable = allowsOffchainSigning && isPending && isOrder && !isRejected
  const isPresignaturePending = status === ActivityStatus.PRESIGNATURE_PENDING && !isRejected
  const isCancelling = status === ActivityStatus.CANCELLING && !isRejected

  const isCancelled = status === ActivityStatus.CANCELLED
  const isConfirmed = status === ActivityStatus.CONFIRMED
  const isExpired = status === ActivityStatus.EXPIRED
  const isUnfillable = isCancellable && (activity as Order).isUnfillable

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
    isPresignaturePending,
    isConfirmed,
    isExpired,
    isCancelling,
    isCancelled,
    isCancellable,
    isUnfillable,
    isRejected,

    // Convenient casting
    order,
    enhancedTransaction,

    // Gnosis Safe
    gnosisSafeInfo,
    gnosisSafeTransaction,
    gnosisSafeOldNonce,
  }
}

export default function Activity({ activity: activityData }: { activity: ActivityDescriptors }) {
  const { chainId } = useActiveWeb3React()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()

  // Get some derived information about the activity. It helps to simplify the rendering of the sub-components
  const activityDerivedState = useMemo(
    () => getActivityDerivedState({ chainId, activityData, allowsOffchainSigning, gnosisSafeInfo }),
    [chainId, activityData, allowsOffchainSigning, gnosisSafeInfo]
  )
  console.log('activityDerivedState', activityDerivedState)

  if (!activityDerivedState || !chainId) return null
  const { activityLinkUrl } = activityDerivedState
  const hasLink = activityLinkUrl !== null

  const creationTimeEnhanced = activityDerivedState?.enhancedTransaction?.addedTime
  const creationTimeOrder = activityDerivedState?.order?.creationTime
  const creationTimeFull = creationTimeEnhanced
    ? new Date(creationTimeEnhanced)
    : creationTimeOrder
    ? new Date(Date.parse(creationTimeOrder))
    : undefined

  const timeFormatOptionHM: Intl.DateTimeFormatOptions = {
    timeStyle: 'short',
  }

  // Hour:Minute
  const creationTime = creationTimeFull?.toLocaleString(undefined, timeFormatOptionHM)

  return (
    <Wrapper>
      <TransactionWrapper>
        <RowFixed>
          {/* Details of activity: transaction/order details */}
          <ActivityDetailsText>
            <ActivityDetails
              chainId={chainId}
              activityDerivedState={activityDerivedState}
              activityLinkUrl={activityLinkUrl ?? undefined}
              disableMouseActions={!hasLink}
              creationTime={creationTime && creationTime}
            />
          </ActivityDetailsText>
        </RowFixed>

        {/* Status Details: icon, cancel, links */}
        <StatusDetails chainId={chainId} activityDerivedState={activityDerivedState} />
      </TransactionWrapper>
    </Wrapper>
  )
}
