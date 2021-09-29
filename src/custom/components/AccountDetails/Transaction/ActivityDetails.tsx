import React from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { OrderStatus } from 'state/orders/actions'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'

import { formatSmart } from 'utils/format'
import { Summary, SummaryInner, SummaryInnerRow, TransactionAlertMessage } from './styled'
import { getLimitPrice, getExecutionPrice } from 'state/orders/utils'
import { DEFAULT_PRECISION } from 'constants/index'
import { ActivityDerivedState } from './index'

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

interface OrderSummaryType {
  from: string | undefined
  to: string | undefined
  limitPrice: string | undefined
  executionPrice?: string | undefined
  validTo: string | undefined
  fulfillmentTime?: string | undefined
  kind?: string
}

export function ActivityDetails(props: { chainId: number; activityDerivedState: ActivityDerivedState }) {
  const { activityDerivedState } = props
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
        {gnosisSafeInfo && enhancedTransaction && enhancedTransaction.safeTransaction && (
          <GnosisSafeTxDetails
            enhancedTransaction={enhancedTransaction}
            gnosisSafeThreshold={gnosisSafeInfo.threshold}
          />
        )}
      </SummaryInner>
    </Summary>
  )
}
