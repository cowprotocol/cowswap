import React from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { OrderStatus } from 'state/orders/actions'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'

import { formatSmart } from 'utils/format'
import {
  Summary,
  SummaryInner,
  SummaryInnerRow,
  TransactionAlertMessage,
  TransactionInnerDetail,
  TextAlert,
  TransactionState as ActivityLink,
  CreationTimeText,
} from './styled'

import { getLimitPrice, getExecutionPrice } from 'state/orders/utils'
import { DEFAULT_PRECISION } from 'constants/index'
import { ActivityDerivedState } from './index'
import { GnosisSafeLink } from './StatusDetails'

const DEFAULT_ORDER_SUMMARY = {
  from: '',
  to: '',
  limitPrice: '',
  validTo: '',
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
  chainId: number
}): JSX.Element | null {
  const { enhancedTransaction, gnosisSafeThreshold, chainId } = props

  if (!enhancedTransaction || !enhancedTransaction.safeTransaction) {
    return null
  }

  const { confirmations, nonce } = enhancedTransaction.safeTransaction
  const numConfirmations = confirmations?.length ?? 0
  const pendingSignaturesCount = gnosisSafeThreshold - numConfirmations
  const isPendingSignatures = pendingSignaturesCount > 0

  return (
    <TransactionInnerDetail>
      <strong>Gnosis Safe</strong>
      <span>
        Safe Nonce: <b>{nonce}</b>
      </span>
      <span>
        Signed:{' '}
        <b>
          {numConfirmations} out of {gnosisSafeThreshold} signers
        </b>
      </span>
      {isPendingSignatures && (
        <TextAlert isPending={isPendingSignatures}>
          {pendingSignaturesCount} more signature{pendingSignaturesCount > 1 ? 's are' : ' is'} required
        </TextAlert>
      )}

      {/* View in: Gnosis Safe */}
      {/* TODO: Load gnosisSafeThreshold (not default!) */}

      {/* Gnosis Safe Web Link (only shown when the transaction has been mined) */}
      {/* {enhancedTransaction && enhancedTransaction.safeTransaction && ( */}
      {enhancedTransaction && (
        <GnosisSafeLink chainId={chainId} enhancedTransaction={enhancedTransaction} gnosisSafeThreshold={2} />
      )}
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
  creationTime: string | undefined
}) {
  const { activityDerivedState, chainId, activityLinkUrl, disableMouseActions, creationTime } = props
  const { id, isOrder, summary, order, enhancedTransaction, isCancelled, isExpired, isUnfillable, gnosisSafeInfo } =
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

    const DateFormatOptions: Intl.DateTimeFormatOptions = {
      dateStyle: 'medium',
      timeStyle: 'short',
    }

    orderSummary = {
      ...DEFAULT_ORDER_SUMMARY,
      from: `${formatSmart(sellAmt.add(feeAmt))} ${sellAmt.currency.symbol}`,
      to: `${formatSmart(outputAmount)} ${outputAmount.currency.symbol}`,
      limitPrice: limitPrice && getPriceFormat(limitPrice),
      executionPrice: executionPrice && getPriceFormat(executionPrice),
      validTo: validTo ? new Date((validTo as number) * 1000).toLocaleString(undefined, DateFormatOptions) : undefined,
      fulfillmentTime: fulfillmentTime
        ? new Date(fulfillmentTime).toLocaleString(undefined, DateFormatOptions)
        : undefined,
      kind: kind.toString(),
    }
  } else {
    orderSummary = DEFAULT_ORDER_SUMMARY
  }

  const { kind, from, to, executionPrice, limitPrice, fulfillmentTime, validTo } = orderSummary
  const activityName = isOrder ? `${kind} order` : 'Transaction'

  return (
    <Summary>
      <span>
        {creationTime && <CreationTimeText>{creationTime}</CreationTimeText>}

        <b>{activityName} </b>
        {activityLinkUrl && (
          <ActivityLink href={activityLinkUrl} disableMouseActions={disableMouseActions}>
            View details ↗
          </ActivityLink>
        )}
      </span>
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
        {gnosisSafeInfo && enhancedTransaction && enhancedTransaction.safeTransaction && (
          <GnosisSafeTxDetails
            enhancedTransaction={enhancedTransaction}
            gnosisSafeThreshold={gnosisSafeInfo.threshold}
            chainId={chainId}
          />
        )}
      </SummaryInner>
    </Summary>
  )
}
