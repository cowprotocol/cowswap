import React, { useCallback, useEffect, useState } from 'react'
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

import { ActivityStatus, ActivityType, useActivityDescriptors } from 'hooks/useRecentActivity'
import { useCancelOrder } from 'hooks/useCancelOrder'
import { LinkStyledButton } from 'theme'
import { ButtonPrimary } from 'components/Button'
import { GpModal as Modal } from 'components/Modal'
import { Order, OrderStatus } from 'state/orders/actions'

import SVG from 'react-inlinesvg'
import TxArrowsImage from 'assets/cow-swap/transaction-arrows.svg'
import TxCheckImage from 'assets/cow-swap/transaction-confirmed.svg'
import OrderCheckImage from 'assets/cow-swap/order-check.svg'
import OrderExpiredImage from 'assets/cow-swap/order-expired.svg'
import OrderCancelledImage from 'assets/cow-swap/order-cancelled.svg'
import OrderOpenImage from 'assets/cow-swap/order-open.svg'

import { formatSmart } from 'utils/format'
import {
  Wrapper,
  Summary,
  SummaryInner,
  SummaryInnerRow,
  TransactionWrapper,
  TransactionAlertMessage,
  TransactionStatusText,
  StatusLabel,
  StatusLabelWrapper,
  StatusLabelBelow,
  TransactionState,
  CancellationSummary,
  IconType,
} from './styled'
import { getLimitPrice, getExecutionPrice } from 'state/orders/utils'
import { DEFAULT_PRECISION } from 'constants/index'

const DEFAULT_ORDER_SUMMARY = {
  from: '',
  to: '',
  limitPrice: '',
  validTo: '',
}

const PILL_COLOUR_MAP = {
  CONFIRMED: '#3B7848',
  PENDING_ORDER: '#43758C',
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

function ActivitySummary(params: {
  id: string
  activityData: ReturnType<typeof useActivityDescriptors>
  isCancelled?: boolean
  isExpired?: boolean
  isUnfillable?: boolean
}) {
  const { id, activityData, isCancelled, isExpired, isUnfillable } = params

  if (!activityData) return null

  const { activity, type, summary } = activityData
  const isOrder = activity && type === ActivityType.ORDER

  // Order Summary default object
  let orderSummary: OrderSummaryType
  if (isOrder) {
    const order = activity as Order
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

export default function Transaction({ hash: id }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  // Return info necessary for rendering order/transaction info from the incoming id
  // returns info related to activity: TransactionDetails | Order
  const activityData = useActivityDescriptors({ id, chainId })

  const [showCancelModal, setShowCancelModal] = useState(false)

  if (!activityData || !chainId) return null

  const { activity, status, type } = activityData

  // Type of Statuses
  const isPending = status === ActivityStatus.PENDING
  const isConfirmed = status === ActivityStatus.CONFIRMED
  const isExpired = status === ActivityStatus.EXPIRED
  const isCancelling = status === ActivityStatus.CANCELLING
  const isCancelled = status === ActivityStatus.CANCELLED
  const isCancellable = isPending && type === ActivityType.ORDER
  const isUnfillable = isCancellable && (activity as Order).isUnfillable

  // Type of Transaction
  const isTransaction = type === ActivityType.TX

  const onCancelClick = () => setShowCancelModal(true)
  const onDismiss = () => setShowCancelModal(false)

  return (
    <Wrapper>
      <TransactionWrapper>
        <TransactionState href={getEtherscanLink(chainId, id, 'transaction')}>
          <RowFixed>
            {activity && (
              <IconType color={determinePillColour(status, type)}>
                <IconWrapper pending={isPending || isCancelling} success={isConfirmed || isCancelled}>
                  {isPending || isCancelling ? (
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
            )}
            <TransactionStatusText>
              <ActivitySummary
                activityData={activityData}
                id={id}
                isCancelled={isCancelled}
                isExpired={isExpired}
                isUnfillable={isUnfillable}
              />
            </TransactionStatusText>
          </RowFixed>
        </TransactionState>

        <StatusLabelWrapper>
          <StatusLabel color={determinePillColour(status, type)} isPending={isPending} isCancelling={isCancelling}>
            {isConfirmed ? (
              <SVG src={OrderCheckImage} description="Order Filled" />
            ) : isExpired ? (
              <SVG src={OrderExpiredImage} description="Order Expired" />
            ) : isCancelled ? (
              <SVG src={OrderCancelledImage} description="Order Cancelled" />
            ) : isCancelling ? null : (
              <SVG src={OrderOpenImage} description="Order Open" />
            )}
            {isPending
              ? 'Open'
              : isConfirmed && isTransaction
              ? 'Approved'
              : isConfirmed
              ? 'Filled'
              : isExpired
              ? 'Expired'
              : isCancelling
              ? 'Cancelling...'
              : isCancelled
              ? 'Cancelled'
              : 'Open'}
          </StatusLabel>

          {isCancellable && (
            <StatusLabelBelow>
              <LinkStyledButton onClick={onCancelClick}>Cancel order</LinkStyledButton>
              {showCancelModal && (
                <CancellationModal
                  orderId={id}
                  summary={activityData.summary}
                  isOpen={showCancelModal}
                  onDismiss={onDismiss}
                />
              )}
            </StatusLabelBelow>
          )}
        </StatusLabelWrapper>
      </TransactionWrapper>
    </Wrapper>
  )
}
