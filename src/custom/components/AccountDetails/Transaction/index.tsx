import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useActiveWeb3React } from 'hooks/web3'
import { getEtherscanLink, shortenOrderId } from 'utils'
import { RowFixed } from 'components/Row'
import Loader from 'components/Loader'
import { IconWrapper } from '../TransactionMod'
import {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'

import { ActivityDescriptors, ActivityStatus, ActivityType, useActivityDescriptors } from 'hooks/useRecentActivity'
import { useCancelOrder } from 'hooks/useCancelOrder'
import { ExternalLink, LinkStyledButton } from 'theme'
import { ButtonPrimary } from 'components/Button'
import { GpModal as Modal } from 'components/Modal'
import { Order, OrderStatus } from 'state/orders/actions'

import SVG from 'react-inlinesvg'
import TxArrowsImage from 'assets/cow-swap/transaction-arrows.svg'
import TxCheckImage from 'assets/cow-swap/transaction-confirmed.svg'
import OrderCheckImage from 'assets/cow-swap/order-check.svg'
import OrderExpiredImage from 'assets/cow-swap/order-expired.svg'
import OrderCancelledImage from 'assets/cow-swap/order-cancelled.svg'
import { PenTool as PresignaturePendingImage } from 'react-feather'
// import PresignaturePendingImage from 'assets/cow-swap/order-presignature-pending.svg'
import OrderOpenImage from 'assets/cow-swap/order-open.svg'

import { formatSmart } from 'utils/format'
import {
  Wrapper,
  Summary,
  SummaryInner,
  SummaryInnerRow,
  TransactionWrapper,
  TransactionAlertMessage,
  TransactionStatusText as ActivityDetailsText,
  StatusLabel,
  StatusLabelWrapper,
  StatusLabelBelow,
  TransactionState as ActivityLink,
  CancellationSummary,
  IconType,
} from './styled'
import { getLimitPrice, getExecutionPrice } from 'state/orders/utils'
import { DEFAULT_PRECISION } from 'constants/index'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { getSafeWebUrl } from 'api/gnosisSafe'
import { getExplorerOrderLink } from 'utils/explorer'

const DEFAULT_ORDER_SUMMARY = {
  from: '',
  to: '',
  limitPrice: '',
  validTo: '',
}

const PILL_COLOUR_MAP = {
  CONFIRMED: '#3B7848',
  PENDING_ORDER: '#43758C',
  PRESIGNATURE_PENDING: '#43758C',
  PENDING_TX: '#43758C',
  EXPIRED_ORDER: '#ED673A',
  CANCELLED_ORDER: '#ED673A',
  CANCELLING_ORDER: '#ED673A',
}

function determinePillColour(status: ActivityStatus, type: ActivityType) {
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

interface OrderSummaryType {
  from: string | undefined
  to: string | undefined
  limitPrice: string | undefined
  executionPrice?: string | undefined
  validTo: string | undefined
  fulfillmentTime?: string | undefined
  kind?: string
}

function ActivityDetails(props: { chainId: number; activityDerivedState: ActivityDerivedState }) {
  const { activityDerivedState } = props
  const { id, isOrder, summary, order, enhancedTransaction, isCancelled, isExpired, isUnfillable } =
    activityDerivedState

  if (!order && !enhancedTransaction) return null

  // Order Summary default object
  let orderSummary: OrderSummaryType
  if (order) {
    const { inputToken, sellAmount, feeAmount, outputToken, buyAmount, validTo, kind, fulfillmentTime } = order

    const sellAmt = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
    const feeAmt = CurrencyAmount.fromRawAmount(inputToken, feeAmount.toString())
    const outputAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())
    const sellTokenDecimals = order?.inputToken?.decimals ?? DEFAULT_PRECISION
    const buyTokenDecimals = order?.outputToken?.decimals ?? DEFAULT_PRECISION

    const limitPrice = formatSmart(
      getLimitPrice({
        buyAmount: order.buyAmount.toString(),
        sellAmount: order.sellAmount.toString(),
        buyTokenDecimals,
        sellTokenDecimals,
        inverted: true, // TODO: handle invert price
      })
    )

    let executionPrice: string | undefined
    if (order.apiAdditionalInfo && order.status === OrderStatus.FULFILLED) {
      const { executedSellAmountBeforeFees, executedBuyAmount } = order.apiAdditionalInfo
      executionPrice = formatSmart(
        getExecutionPrice({
          executedSellAmountBeforeFees,
          executedBuyAmount,
          buyTokenDecimals,
          sellTokenDecimals,
          inverted: true, // TODO: Handle invert price
        })
      )
    }

    const getPriceFormat = (price: string): string => {
      return `${price} ${sellAmt.currency.symbol} per ${outputAmount.currency.symbol}`
    }

    orderSummary = {
      ...DEFAULT_ORDER_SUMMARY,
      from: `${formatSmart(sellAmt.add(feeAmt))} ${sellAmt.currency.symbol}`,
      to: `${formatSmart(outputAmount)} ${outputAmount.currency.symbol}`,
      limitPrice: limitPrice && getPriceFormat(limitPrice),
      executionPrice: executionPrice && getPriceFormat(executionPrice),
      validTo: new Date((validTo as number) * 1000).toLocaleString(),
      fulfillmentTime: fulfillmentTime ? new Date(fulfillmentTime).toLocaleString() : undefined,
      kind: kind.toString(),
    }
  } else {
    orderSummary = DEFAULT_ORDER_SUMMARY
  }

  const { kind, from, to, executionPrice, limitPrice, fulfillmentTime, validTo } = orderSummary
  return (
    <Summary>
      <b>{isOrder ? `${kind} order` : 'Transaction'} ↗</b>
      <SummaryInner>
        {isOrder ? (
          <>
            <SummaryInnerRow>
              <b>From{kind === 'buy' && ' at most'}</b>
              <i>{from}</i>
            </SummaryInnerRow>
            <SummaryInnerRow>
              <b>To{kind === 'sell' && ' at least'}</b>
              <i>{to}</i>
            </SummaryInnerRow>
            <SummaryInnerRow>
              {executionPrice ? (
                <>
                  {' '}
                  <b>Exec. price</b>
                  <i>{executionPrice}</i>
                </>
              ) : (
                <>
                  {' '}
                  <b>Limit price</b>
                  <i>{limitPrice}</i>
                </>
              )}
            </SummaryInnerRow>
            {isUnfillable && unfillableAlert()}
            <SummaryInnerRow isCancelled={isCancelled} isExpired={isExpired}>
              {fulfillmentTime ? (
                <>
                  <b>Filled on</b>
                  <i>{fulfillmentTime}</i>
                </>
              ) : (
                <>
                  <b>Valid to</b>
                  <i>{validTo}</i>
                </>
              )}
            </SummaryInnerRow>
          </>
        ) : (
          summary ?? id
        )}
        {/* TODO: Load gnosisSafeThreshold (not default!) */}
        {enhancedTransaction && enhancedTransaction.safeTransaction && (
          <GnosisSafeTxDetails enhancedTransaction={enhancedTransaction} gnosisSafeThreshold={2} />
        )}
      </SummaryInner>
    </Summary>
  )
}

type RequestCancellationModalProps = {
  onDismiss: () => void
  onClick: () => void
  summary?: string
  shortId: string
}

function RequestCancellationModal(props: RequestCancellationModalProps): JSX.Element {
  const { onDismiss, onClick, summary, shortId } = props

  const [showMore, setShowMore] = useState(false)

  const toggleShowMore = () => setShowMore((showMore) => !showMore)

  return (
    <ConfirmationModalContent
      title={`Cancel order ${shortId}`}
      onDismiss={onDismiss}
      topContent={() => (
        <>
          <p>
            Are you sure you want to cancel order <strong>{shortId}</strong>?
          </p>
          <CancellationSummary>{summary}</CancellationSummary>
          <p>
            Keep in mind this is a soft cancellation{' '}
            <LinkStyledButton onClick={toggleShowMore}>[{showMore ? '- less' : '+ more'}]</LinkStyledButton>
          </p>
          {showMore && (
            <>
              <p>
                This means that a solver might already have included the order in a solution even if this cancellation
                is successful. Read more in the{' '}
                <a target="_blank" href="/#/faq#can-i-cancel-an-order">
                  FAQ
                </a>
                .
              </p>
            </>
          )}
        </>
      )}
      bottomContent={() => <ButtonPrimary onClick={onClick}>Request cancellation</ButtonPrimary>}
    />
  )
}

type CancellationModalProps = {
  onDismiss: () => void
  isOpen: boolean
  orderId: string
  summary: string | undefined
}

function CancellationModal(props: CancellationModalProps): JSX.Element | null {
  const { orderId, isOpen, onDismiss, summary } = props
  const shortId = shortenOrderId(orderId)

  const [isWaitingSignature, setIsWaitingSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelOrder = useCancelOrder()

  useEffect(() => {
    // Reset status every time orderId changes to avoid race conditions
    setIsWaitingSignature(false)
    setError(null)
  }, [orderId])

  const onClick = useCallback(() => {
    setIsWaitingSignature(true)
    setError(null)

    cancelOrder(orderId)
      .then(onDismiss)
      .catch((e) => {
        setError(e.message)
      })
  }, [cancelOrder, onDismiss, orderId])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {error !== null ? (
        <TransactionErrorContent onDismiss={onDismiss} message={error || 'Failed to cancel order'} />
      ) : isWaitingSignature ? (
        <ConfirmationPendingContent
          onDismiss={onDismiss}
          pendingText={`Soft cancelling order with id ${shortId}\n\n${summary}`}
        />
      ) : (
        <RequestCancellationModal onDismiss={onDismiss} onClick={onClick} summary={summary} shortId={shortId} />
      )}
    </Modal>
  )
}

function unfillableAlert(): JSX.Element {
  return (
    <>
      <TransactionAlertMessage>
        <p>
          <span role="img" aria-label="alert">
            🚨
          </span>{' '}
          Limit price out of range. Wait for a matching price or cancel your order.
        </p>
      </TransactionAlertMessage>
    </>
  )
}

function GnosisSafeTxDetails(props: {
  enhancedTransaction: EnhancedTransactionDetails | null
  gnosisSafeThreshold: number
}): JSX.Element | null {
  const { enhancedTransaction, gnosisSafeThreshold } = props

  if (!enhancedTransaction || !enhancedTransaction.safeTransaction) {
    return null
  }

  const { confirmations, nonce } = enhancedTransaction.safeTransaction
  const numConfirmations = confirmations?.length ?? 0
  const pendingSignatures = gnosisSafeThreshold - numConfirmations

  return (
    <>
      <div>
        Gnosis Safe transaction. Nonce: <strong>{nonce}</strong>
      </div>
      {pendingSignatures > 0 && <div>{pendingSignatures} more signatures are required</div>}
    </>
  )
}

function GnosisSafeLink(props: {
  chainId: number
  enhancedTransaction: EnhancedTransactionDetails | null
  gnosisSafeThreshold: number
}): JSX.Element | null {
  const { chainId, enhancedTransaction } = props

  if (!enhancedTransaction || !enhancedTransaction.safeTransaction) {
    return null
  }

  const { safe } = enhancedTransaction.safeTransaction
  const safeUrl = getSafeWebUrl(chainId, safe)

  if (safeUrl === null) {
    return null
  }

  return <ExternalLink href={safeUrl}>View Gnosis Safe</ExternalLink>
}

/**
 * Object derived from the activity state
 */
interface ActivityDerivedState {
  id: string
  status: ActivityStatus
  type: ActivityType
  summary?: string
  activityLink?: string

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
}

function StateIcon(props: { activityDerivedState: ActivityDerivedState }) {
  const { status, type, isPending, isCancelling, isConfirmed, isExpired, isCancelled, isPresignaturePending } =
    props.activityDerivedState

  return (
    <IconType color={determinePillColour(status, type)}>
      <IconWrapper pending={isPending || isCancelling} success={isConfirmed || isCancelled}>
        {isPending || isPresignaturePending || isCancelling ? (
          <Loader />
        ) : isConfirmed ? (
          <SVG src={TxCheckImage} description="Order Filled" />
        ) : isExpired ? (
          <SVG src={TxArrowsImage} description="Order Expired" />
        ) : isCancelled ? (
          <SVG src={TxArrowsImage} description="Order Cancelled" />
        ) : (
          <SVG src={TxArrowsImage} description="Order Open" />
        )}
      </IconWrapper>
    </IconType>
  )
}

function StatusDetails(props: { chainId: number; activityDerivedState: ActivityDerivedState }) {
  const { chainId, activityDerivedState } = props

  const {
    id,
    status,
    type,
    summary,
    enhancedTransaction,
    isPending,
    isCancelling,
    isPresignaturePending,
    isConfirmed,
    isExpired,
    isTransaction,
    isCancelled,
    isCancellable,
  } = activityDerivedState

  const [showCancelModal, setShowCancelModal] = useState(false)

  const onCancelClick = () => setShowCancelModal(true)
  const onDismiss = () => setShowCancelModal(false)

  return (
    <StatusLabelWrapper>
      <StatusLabel
        color={determinePillColour(status, type)}
        isPending={isPending}
        isCancelling={isCancelling}
        isPresignaturePending={isPresignaturePending}
      >
        {isConfirmed && isTransaction ? (
          <SVG src={OrderCheckImage} description="Transaction Confirmed" />
        ) : isConfirmed ? (
          <SVG src={OrderCheckImage} description="Order Filled" />
        ) : isExpired && isTransaction ? (
          <SVG src={OrderCancelledImage} description="Transaction Failed" />
        ) : isExpired ? (
          <SVG src={OrderExpiredImage} description="Order Expired" />
        ) : isCancelled ? (
          <SVG src={OrderCancelledImage} description="Order Cancelled" />
        ) : isPresignaturePending ? (
          // <SVG src={PresignaturePendingImage} description="Pending pre-signature" />
          <PresignaturePendingImage size={16} />
        ) : isCancelling ? null : (
          <SVG src={OrderOpenImage} description="Order Open" />
        )}
        {isPending
          ? 'Open'
          : isConfirmed && isTransaction
          ? 'Approved'
          : isConfirmed
          ? 'Filled'
          : isExpired && isTransaction
          ? 'Failed'
          : isExpired
          ? 'Expired'
          : isCancelling
          ? 'Cancelling...'
          : isPresignaturePending
          ? 'Pre-signing...'
          : isCancelled
          ? 'Cancelled'
          : 'Open'}
      </StatusLabel>

      {/* Gnosis Safe Web Link (only shown when the transaction has been mined) */}
      {enhancedTransaction && enhancedTransaction.safeTransaction && (
        <StatusLabelBelow>
          {/* View in: Gnosis Safe */}
          {/* TODO: Load gnosisSafeThreshold (not default!) */}
          <GnosisSafeLink chainId={chainId} enhancedTransaction={enhancedTransaction} gnosisSafeThreshold={2} />
        </StatusLabelBelow>
      )}

      {isCancellable && (
        <StatusLabelBelow>
          {/* Cancel order */}
          <LinkStyledButton onClick={onCancelClick}>Cancel order</LinkStyledButton>
          {showCancelModal && (
            <CancellationModal orderId={id} summary={summary} isOpen={showCancelModal} onDismiss={onDismiss} />
          )}
        </StatusLabelBelow>
      )}
    </StatusLabelWrapper>
  )
}

function getActivityLink(params: {
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
}): ActivityDerivedState | null {
  const { chainId, id, activityData, allowsOffchainSigning } = props
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

  const activityLink = getActivityLink({ id, chainId, enhancedTransaction, order })

  return {
    id,
    status,
    type,
    summary,
    activityLink,

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
  }
}

export default function Transaction({ hash: id }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  const { allowsOffchainSigning } = useWalletInfo()
  // Return info necessary for rendering order/transaction info from the incoming id
  //    - activity data can be either EnhancedTransactionDetails or Order
  const activityData = useActivityDescriptors({ id, chainId })

  // Get some derived information about the activity. It helps to simplify the rendering of the sub-components
  const activityDerivedState = useMemo(
    () => getActivityDerivedState({ chainId, id, activityData, allowsOffchainSigning }),
    [chainId, id, activityData, allowsOffchainSigning]
  )

  console.log('activityDerivedState', activityDerivedState)

  if (!activityDerivedState || !chainId) return null
  const { activityLink } = activityDerivedState
  const hasLink = activityLink !== null

  return (
    <Wrapper>
      <TransactionWrapper>
        <ActivityLink href={activityLink ?? undefined} disableMouseActions={!hasLink}>
          <RowFixed>
            {/* Icon state: confirmed, expired, canceled, pending, ...  */}
            {activityData?.activity && <StateIcon activityDerivedState={activityDerivedState} />}

            {/* Details of activity: transaction/order details */}
            <ActivityDetailsText>
              <ActivityDetails chainId={chainId} activityDerivedState={activityDerivedState} />
            </ActivityDetailsText>
          </RowFixed>
        </ActivityLink>

        {/* Status Details: icon, cancel, links */}
        <StatusDetails chainId={chainId} activityDerivedState={activityDerivedState} />
      </TransactionWrapper>
    </Wrapper>
  )
}
