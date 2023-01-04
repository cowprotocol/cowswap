import React from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { OrderStatus } from 'state/orders/actions'

import { formatSmart } from 'utils/format'
import {
  Summary,
  SummaryInner,
  SummaryInnerRow,
  TransactionInnerDetail,
  TextAlert,
  TransactionState as ActivityLink,
  CreationTimeText,
  ActivityVisual,
} from './styled'

import { V_COW_CONTRACT_ADDRESS } from 'constants/index'
import { ActivityDerivedState } from './index'
import { GnosisSafeLink } from './StatusDetails'
import CurrencyLogo from 'components/CurrencyLogo'
import { OrderProgressBar } from 'components/OrderProgressBar'
import { useToken } from 'hooks/Tokens'
import { ActivityStatus } from 'hooks/useRecentActivity'
import { getActivityState } from 'hooks/useActivityDerivedState'
import { V_COW, COW } from 'constants/tokens'
import { RateInfoParams, RateInfo } from '@cow/common/pure/RateInfo'
import { EthFlowStepper } from '@cow/modules/swap/containers/EthFlowStepper'
import { StatusDetails } from './StatusDetails'
import { useCancelOrder } from '@cow/common/hooks/useCancelOrder'

const DEFAULT_ORDER_SUMMARY = {
  from: '',
  to: '',
  limitPrice: '',
  validTo: '',
}

function GnosisSafeTxDetails(props: {
  chainId: number
  activityDerivedState: ActivityDerivedState
}): JSX.Element | null {
  const { chainId, activityDerivedState } = props
  const { gnosisSafeInfo, enhancedTransaction, status, isOrder, order, isExpired, isCancelled, isInvalid } =
    activityDerivedState
  const gnosisSafeThreshold = gnosisSafeInfo?.threshold
  const safeTransaction = enhancedTransaction?.safeTransaction || order?.presignGnosisSafeTx
  if (!gnosisSafeThreshold || !gnosisSafeInfo || !safeTransaction) {
    return null
  }

  // The activity is executed Is tx mined or is the swap executed
  const isExecutedActivity = isOrder
    ? order?.fulfillmentTime !== undefined
    : enhancedTransaction?.confirmedTime !== undefined

  // Check if its in a state where we dont need more signatures. We do this, because this state comes from CoW Swap API, which
  // sometimes can be faster getting the state than Gnosis Safe API (that would give us the pending signatures). We use
  // this check to infer that we don't need to sign anything anymore
  const alreadySigned = isOrder ? status !== ActivityStatus.PRESIGNATURE_PENDING : status !== ActivityStatus.PENDING

  const { confirmations, nonce, isExecuted } = safeTransaction

  const numConfirmations = confirmations?.length ?? 0
  const pendingSignaturesCount = gnosisSafeThreshold - numConfirmations
  const isPendingSignatures = pendingSignaturesCount > 0

  let signaturesMessage: JSX.Element

  const areIsMessage = pendingSignaturesCount > 1 ? 's are' : ' is'

  if (isExecutedActivity) {
    signaturesMessage = <span>Executed</span>
  } else if (isCancelled) {
    signaturesMessage = <span>Cancelled order</span>
  } else if (isExpired) {
    signaturesMessage = <span>Expired order</span>
  } else if (isInvalid) {
    signaturesMessage = <span>Invalid order</span>
  } else if (alreadySigned) {
    signaturesMessage = <span>Enough signatures</span>
  } else if (numConfirmations === 0) {
    signaturesMessage = (
      <>
        <span>
          <b>No signatures yet</b>
        </span>
        <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
          {gnosisSafeThreshold} signature{areIsMessage} required
        </TextAlert>
      </>
    )
  } else if (numConfirmations >= gnosisSafeThreshold) {
    signaturesMessage = isExecuted ? (
      <span>
        <b>Enough signatures</b>
      </span>
    ) : (
      <>
        <span>
          Enough signatures, <b>but not executed</b>
        </span>
        <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
          Execute Gnosis Safe transaction
        </TextAlert>
      </>
    )
  } else {
    signaturesMessage = (
      <>
        <span>
          Signed:{' '}
          <b>
            {numConfirmations} out of {gnosisSafeThreshold} signers
          </b>
        </span>
        <TextAlert isPending={isPendingSignatures} isCancelled={isCancelled} isExpired={isExpired}>
          {pendingSignaturesCount} more signature{areIsMessage} required
        </TextAlert>
      </>
    )
  }

  return (
    <TransactionInnerDetail>
      <span>
        Safe Nonce: <b>{nonce}</b>
      </span>
      {signaturesMessage}

      {/* View in: Gnosis Safe */}
      <GnosisSafeLink chainId={chainId} safeTransaction={safeTransaction} gnosisSafeThreshold={gnosisSafeThreshold} />
    </TransactionInnerDetail>
  )
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

export function ActivityDetails(props: {
  chainId: number
  activityDerivedState: ActivityDerivedState
  activityLinkUrl: string | undefined
  disableMouseActions: boolean | undefined
  creationTime?: string | undefined
}) {
  const { activityDerivedState, chainId, activityLinkUrl, disableMouseActions, creationTime } = props
  const { id, isOrder, summary, order, enhancedTransaction, isCancelled, isExpired } = activityDerivedState
  const activityState = getActivityState(activityDerivedState)
  const tokenAddress =
    enhancedTransaction?.approval?.tokenAddress || (enhancedTransaction?.claim && V_COW_CONTRACT_ADDRESS[chainId])
  const singleToken = useToken(tokenAddress) || null

  const getShowCancellationModal = useCancelOrder()

  const showProgressBar = (activityState === 'open' || activityState === 'filled') && order?.class !== 'limit'
  const showCancellationModal = activityDerivedState.order ? getShowCancellationModal(activityDerivedState.order) : null

  if (!order && !enhancedTransaction) return null

  // Order Summary default object
  let orderSummary: OrderSummaryType
  let rateInfoParams: RateInfoParams = {
    chainId,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    activeRateFiatAmount: null,
    inversedActiveRateFiatAmount: null,
  }
  let isOrderFulfilled = false

  if (order) {
    const {
      inputToken,
      sellAmount,
      feeAmount: feeAmountRaw,
      outputToken,
      buyAmount,
      validTo,
      kind,
      fulfillmentTime,
    } = order

    const inputAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
    const outputAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())
    const feeAmount = CurrencyAmount.fromRawAmount(inputToken, feeAmountRaw.toString())

    isOrderFulfilled = !!order.apiAdditionalInfo && order.status === OrderStatus.FULFILLED

    const { executedSellAmountBeforeFees, executedBuyAmount } = order.apiAdditionalInfo || {}
    const rateInputCurrencyAmount = isOrderFulfilled
      ? CurrencyAmount.fromRawAmount(inputToken, executedSellAmountBeforeFees?.toString() || '0')
      : inputAmount
    const rateOutputCurrencyAmount = isOrderFulfilled
      ? CurrencyAmount.fromRawAmount(outputToken, executedBuyAmount?.toString() || '0')
      : outputAmount

    rateInfoParams = {
      chainId,
      inputCurrencyAmount: rateInputCurrencyAmount,
      outputCurrencyAmount: rateOutputCurrencyAmount,
      activeRateFiatAmount: null,
      inversedActiveRateFiatAmount: null,
    }

    const DateFormatOptions: Intl.DateTimeFormatOptions = {
      dateStyle: 'medium',
      timeStyle: 'short',
    }

    orderSummary = {
      ...DEFAULT_ORDER_SUMMARY,
      from: `${formatSmart(inputAmount.add(feeAmount))} ${inputAmount.currency.symbol}`,
      to: `${formatSmart(outputAmount)} ${outputAmount.currency.symbol}`,
      validTo: validTo ? new Date((validTo as number) * 1000).toLocaleString(undefined, DateFormatOptions) : undefined,
      fulfillmentTime: fulfillmentTime
        ? new Date(fulfillmentTime).toLocaleString(undefined, DateFormatOptions)
        : undefined,
      kind: kind.toString(),
    }
  } else {
    orderSummary = DEFAULT_ORDER_SUMMARY
  }

  const { kind, from, to, fulfillmentTime, validTo } = orderSummary
  const activityName = isOrder ? `${kind} order` : 'Transaction'
  let inputToken = activityDerivedState?.order?.inputToken || null
  let outputToken = activityDerivedState?.order?.outputToken || null

  if (enhancedTransaction?.swapVCow || enhancedTransaction?.swapLockedGNOvCow) {
    inputToken = V_COW[chainId]
    outputToken = COW[chainId]
  }

  return (
    <>
      <Summary>
        <span>
          {creationTime && <CreationTimeText>{creationTime}</CreationTimeText>}

          {/* Token Approval Currency Logo */}
          {!isOrder && singleToken && (
            <ActivityVisual>
              <CurrencyLogo currency={singleToken} size={'24px'} />
            </ActivityVisual>
          )}

          {/* Order Currency Logo */}
          {inputToken && outputToken && (
            <ActivityVisual>
              <CurrencyLogo currency={inputToken} size={'24px'} />
              <CurrencyLogo currency={outputToken} size={'24px'} />
            </ActivityVisual>
          )}
        </span>

        <SummaryInner>
          <b>{activityName}</b>
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
                <b>{isOrderFulfilled ? 'Exec. price' : 'Limit price'}</b>
                <i>
                  <RateInfo noLabel={true} rateInfoParams={rateInfoParams} />
                </i>
              </SummaryInnerRow>
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

          {activityLinkUrl && (
            <ActivityLink href={activityLinkUrl} disableMouseActions={disableMouseActions}>
              View details ↗
            </ActivityLink>
          )}
          <GnosisSafeTxDetails chainId={chainId} activityDerivedState={activityDerivedState} />
        </SummaryInner>

        {/* Status Details: icon, cancel, links */}
        <StatusDetails showCancellationModal={showCancellationModal} activityDerivedState={activityDerivedState} />
      </Summary>

      <EthFlowStepper order={order} />
      {showProgressBar && (
        <OrderProgressBar activityDerivedState={activityDerivedState} chainId={chainId} hideWhenFinished={true} />
      )}
    </>
  )
}
