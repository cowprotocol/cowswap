import React, { useMemo } from 'react'

import { useActiveWeb3React } from 'hooks/web3'
import { getEtherscanLink } from 'utils'
import { RowFixed } from 'components/Row'

import { Wrapper, TransactionWrapper, TransactionStatusText as ActivityDetailsText, CreationDateText } from './styled'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { getSafeWebUrl } from 'api/gnosisSafe'
import { getExplorerOrderLink } from 'utils/explorer'
import { useActivityDescriptors, ActivityStatus, ActivityType, ActivityDescriptors } from 'hooks/useRecentActivity'

import { ActivityDetails } from './ActivityDetails'

import { StatusDetails } from './StatusDetails'
// import { StateIcon } from './StateIcon'
import { Order } from 'state/orders/actions'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'

// ToDo: Refactor to use theme variables instead
const PILL_COLOUR_MAP = {
  CONFIRMED: '#00d897', // Todo: use color '#00815a' for light mode.
  PENDING_ORDER: '#43758C',
  PRESIGNATURE_PENDING: '#43758C',
  PENDING_TX: '#43758C',
  EXPIRED_ORDER: '#ff5722',
  CANCELLED_ORDER: '#ff5722',
  CANCELLING_ORDER: '#ff5722',
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

  // Possible activity types
  enhancedTransaction?: EnhancedTransactionDetails
  order?: Order

  // Gnosis Safe
  gnosisSafeInfo?: SafeInfoResponse
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
      const { safe } = safeTransaction
      return getSafeWebUrl(chainId, safe) ?? undefined
    }
  } else if (order) {
    // Its an order: GP Explorer link
    return getExplorerOrderLink(chainId, id)
  }

  return undefined
}

function getActivityDerivedState(props: {
  chainId?: number
  id: string
  activityData: ActivityDescriptors | null
  allowsOffchainSigning: boolean
  gnosisSafeInfo?: SafeInfoResponse
}): ActivityDerivedState | null {
  const { chainId, id, activityData, allowsOffchainSigning, gnosisSafeInfo } = props
  if (activityData === null || chainId === undefined) {
    return null
  }

  const { activity, status, type, summary } = activityData
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

    // Convenient casting
    order,
    enhancedTransaction,

    // Gnosis Safe
    gnosisSafeInfo,
  }
}

export default function Transaction({ hash: id }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()
  // Return info necessary for rendering order/transaction info from the incoming id
  //    - activity data can be either EnhancedTransactionDetails or Order
  const activityData = useActivityDescriptors({ id, chainId })

  // Get some derived information about the activity. It helps to simplify the rendering of the sub-components
  const activityDerivedState = useMemo(
    () => getActivityDerivedState({ chainId, id, activityData, allowsOffchainSigning, gnosisSafeInfo }),
    [chainId, id, activityData, allowsOffchainSigning, gnosisSafeInfo]
  )

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

  const timeFormatMDY: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const timeFormatHM: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }

  // Month Day, Year
  const creationTimeMDY = creationTimeFull?.toLocaleDateString('en-US', timeFormatMDY)

  // Hour:Minute
  const creationTime = creationTimeFull?.toLocaleTimeString('en-US', timeFormatHM)

  return (
    <Wrapper>
      {creationTimeMDY && <CreationDateText>{creationTimeMDY}</CreationDateText>}
      <TransactionWrapper>
        <RowFixed>
          {/* Icon state: confirmed, expired, canceled, pending, ...  */}
          {/* {activityData?.activity && <StateIcon activityDerivedState={activityDerivedState} />} */}

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
