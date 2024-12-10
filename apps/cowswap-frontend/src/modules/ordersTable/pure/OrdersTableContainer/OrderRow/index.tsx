import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { getAddress, getEtherscanLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command, UiOrderType } from '@cowprotocol/types'
import { Loader, TokenAmount, UI } from '@cowprotocol/ui'
import { PercentDisplay, percentIsAlmostHundred } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

import { CREATING_STATES, OrderStatus } from 'legacy/state/orders/actions'

import { PendingOrderPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { RateInfo } from 'common/pure/RateInfo'
import { getQuoteCurrency } from 'common/services/getQuoteCurrency'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'
import { calculatePercentageInRelationToReference } from 'utils/orderUtils/calculatePercentageInRelationToReference'
import { calculatePriceDifference, PriceDifference } from 'utils/orderUtils/calculatePriceDifference'
import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { EstimatedExecutionPrice } from './EstimatedExecutionPrice'
import { OrderContextMenu } from './OrderContextMenu'
import { WarningTooltip } from './OrderWarning'
import * as styledEl from './styled'

import { OrderParams } from '../../../utils/getOrderParams'
import { OrderStatusBox } from '../../OrderStatusBox'
import { CheckboxCheckmark, TableRow, TableRowCheckbox, TableRowCheckboxWrapper } from '../styled'
import { OrderActions } from '../types'

// Constants
const TIME_AGO_UPDATE_INTERVAL = 3000
const MIN_PERCENTAGE_TO_DISPLAY = 0.01 // Minimum percentage to display (show dash below this)
const GOOD_PRICE_THRESHOLD = 1.0 // 1% or less difference - good price
const FAIR_PRICE_THRESHOLD = 5.0 // 5% or less difference - fair price

// Helper to determine the color based on percentage
function getDistanceColor(percentage: number): string {
  const absPercentage = Math.abs(percentage)

  if (absPercentage <= GOOD_PRICE_THRESHOLD) {
    return `var(${UI.COLOR_SUCCESS})` // Green - good price
  } else if (absPercentage <= FAIR_PRICE_THRESHOLD) {
    return `var(${UI.COLOR_PRIMARY})` // Blue - fair price
  }

  return 'inherit' // Default text color for larger differences
}

function CurrencyAmountItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return (
    <styledEl.AmountItem title={amount.toExact() + ' ' + amount.currency.symbol}>
      <TokenAmount amount={amount} tokenSymbol={amount.currency} />
    </styledEl.AmountItem>
  )
}

function CurrencySymbolItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return <TokenLogo token={amount.currency} size={28} />
}

export interface OrderRowProps {
  order: ParsedOrder
  prices: PendingOrderPrices | undefined | null
  spotPrice: Price<Currency, Currency> | undefined | null
  isRateInverted: boolean
  showLimitPrice: boolean
  isHistoryTab: boolean
  isRowSelectable: boolean
  isRowSelected: boolean
  isChild?: boolean
  orderParams: OrderParams
  onClick: Command
  orderActions: OrderActions
  hasValidPendingPermit?: boolean | undefined
  children?: React.ReactNode
}

export function OrderRow({
  order,
  isRateInverted: isGloballyInverted,
  showLimitPrice,
  isHistoryTab,
  isRowSelectable,
  isRowSelected,
  isChild,
  orderActions,
  orderParams,
  onClick,
  prices,
  spotPrice,
  hasValidPendingPermit,
  children,
}: OrderRowProps) {
  const { buyAmount, rateInfoParams, hasEnoughAllowance, hasEnoughBalance, chainId } = orderParams
  const { creationTime, expirationTime, status } = order
  const { filledPercentDisplay, executedPrice } = order.executionData
  const { inputCurrencyAmount, outputCurrencyAmount } = rateInfoParams
  const { estimatedExecutionPrice, feeAmount } = prices || {}

  const showCancellationModal = useMemo(() => {
    return orderActions.getShowCancellationModal(order)
  }, [orderActions, order])
  const alternativeOrderModalContext = useMemo(
    () => orderActions.getAlternativeOrderModalContext(order),
    [order, orderActions],
  )

  const withAllowanceWarning =
    hasEnoughAllowance === false && (hasValidPendingPermit === false || hasValidPendingPermit === undefined)
  const withWarning =
    (hasEnoughBalance === false || withAllowanceWarning) &&
    // show the warning only for pending and scheduled orders
    (status === OrderStatus.PENDING || status === OrderStatus.SCHEDULED)
  const isOrderScheduled = order.status === OrderStatus.SCHEDULED

  const isScheduledCreating = isOrderScheduled && Date.now() > creationTime.getTime()
  const expirationTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const creationTimeAgo = useTimeAgo(creationTime, TIME_AGO_UPDATE_INTERVAL)
  const fulfillmentTimeAgo = useTimeAgo(
    order.fulfillmentTime ? new Date(order.fulfillmentTime) : undefined,
    TIME_AGO_UPDATE_INTERVAL,
  )
  const activityUrl = chainId ? getActivityUrl(chainId, order) : undefined

  const [isInverted, setIsInverted] = useState(() => {
    // On mount, apply smart quote selection
    const quoteCurrency = getQuoteCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
    return getAddress(quoteCurrency) === getAddress(inputCurrencyAmount?.currency)
  })
  const toggleIsInverted = useCallback(() => setIsInverted((curr) => !curr), [])

  // Toggle isInverted whenever isGloballyInverted changes
  useEffect(() => {
    toggleIsInverted()
  }, [isGloballyInverted, toggleIsInverted])

  const executionPriceInverted = isInverted ? estimatedExecutionPrice?.invert() : estimatedExecutionPrice
  const executedPriceInverted = isInverted ? executedPrice?.invert() : executedPrice
  const spotPriceInverted = isInverted ? spotPrice?.invert() : spotPrice

  const priceDiffs = usePricesDifference(prices, spotPrice)
  const feeDifference = useFeeAmountDifference(rateInfoParams, prices)

  const isExecutedPriceZero = executedPriceInverted !== undefined && executedPriceInverted?.equalTo(ZERO_FRACTION)

  const isUnfillable = !percentIsAlmostHundred(filledPercentDisplay) && (isExecutedPriceZero || withWarning)
  const isOrderCreating = CREATING_STATES.includes(order.status)

  const inputTokenSymbol = order.inputToken.symbol || ''

  const getWarningText = () => {
    if (hasEnoughBalance === false) return 'Insufficient balance'
    if (hasEnoughAllowance === false) return 'Insufficient allowance'
    return 'Unfillable'
  }

  return (
    <TableRow data-id={order.id} isChildOrder={isChild} isHistoryTab={isHistoryTab} isRowSelectable={isRowSelectable}>
      {/*Checkbox for multiple cancellation*/}
      {isRowSelectable && !isHistoryTab && (
        <TableRowCheckboxWrapper>
          <TableRowCheckbox
            type="checkbox"
            checked={isRowSelected}
            disabled={getIsEthFlowOrder(order.inputToken.address) || !isOrderCancellable(order)}
            onChange={() => orderActions.toggleOrderForCancellation(order)}
          />
          <CheckboxCheckmark />
        </TableRowCheckboxWrapper>
      )}

      {/* Order sell/buy tokens */}
      <styledEl.CurrencyCell>
        <styledEl.CurrencyLogoPair clickable onClick={onClick}>
          <CurrencySymbolItem amount={getSellAmountWithFee(order)} />
          <CurrencySymbolItem amount={buyAmount} />
        </styledEl.CurrencyLogoPair>
        <styledEl.CurrencyAmountWrapper clickable onClick={onClick}>
          <CurrencyAmountItem amount={getSellAmountWithFee(order)} />
          <CurrencyAmountItem amount={buyAmount} />
        </styledEl.CurrencyAmountWrapper>
      </styledEl.CurrencyCell>

      {/* Non-history tab columns */}
      {!isHistoryTab ? (
        <>
          {/* Fills at / Limit price */}
          <styledEl.PriceElement onClick={toggleIsInverted}>
            {showLimitPrice ? (
              <styledEl.RateValue onClick={toggleIsInverted}>
                <RateInfo
                  prependSymbol={false}
                  isInvertedState={[isInverted, setIsInverted]}
                  noLabel={true}
                  doNotUseSmartQuote
                  isInverted={isInverted}
                  rateInfoParams={rateInfoParams}
                  opacitySymbol={true}
                />
              </styledEl.RateValue>
            ) : (
              <>
                {getIsFinalizedOrder(order) ? (
                  '-'
                ) : prices && estimatedExecutionPrice ? (
                  <styledEl.ExecuteCellWrapper>
                    {priceDiffs?.percentage &&
                    Math.abs(Number(priceDiffs.percentage.toFixed(4))) <= MIN_PERCENTAGE_TO_DISPLAY ? (
                      <span>⚡️ Pending execution</span>
                    ) : (
                      <EstimatedExecutionPrice
                        amount={executionPriceInverted}
                        tokenSymbol={executionPriceInverted?.quoteCurrency}
                        opacitySymbol
                        isInverted={isInverted}
                        percentageDifference={priceDiffs?.percentage}
                        amountDifference={priceDiffs?.amount}
                        percentageFee={feeDifference}
                        amountFee={feeAmount}
                        canShowWarning={getUiOrderType(order) !== UiOrderType.SWAP && !isUnfillable}
                        isUnfillable={withWarning}
                        warningText={getWarningText()}
                        WarningTooltip={(props) => (
                          <WarningTooltip
                            hasEnoughBalance={hasEnoughBalance ?? false}
                            hasEnoughAllowance={hasEnoughAllowance ?? false}
                            hasValidPendingPermit={hasValidPendingPermit}
                            inputTokenSymbol={inputTokenSymbol}
                            isOrderScheduled={isOrderScheduled}
                            onApprove={() => orderActions.approveOrderToken(order.inputToken)}
                            {...props}
                          />
                        )}
                      />
                    )}
                  </styledEl.ExecuteCellWrapper>
                ) : prices === null || !estimatedExecutionPrice || isOrderCreating ? (
                  '-'
                ) : (
                  <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
                )}
              </>
            )}
          </styledEl.PriceElement>

          {/* Distance to market */}
          <styledEl.PriceElement>
            {isUnfillable ? (
              '-'
            ) : priceDiffs?.percentage && Number(priceDiffs.percentage.toFixed(4)) >= MIN_PERCENTAGE_TO_DISPLAY ? (
              <styledEl.DistanceToMarket $color={getDistanceColor(Number(priceDiffs.percentage.toFixed(4)))}>
                {priceDiffs.percentage.toFixed(2)}%
              </styledEl.DistanceToMarket>
            ) : (
              '-'
            )}
          </styledEl.PriceElement>

          {/* Market price */}
          <styledEl.PriceElement onClick={toggleIsInverted}>
            {spotPrice ? (
              <TokenAmount amount={spotPriceInverted} tokenSymbol={spotPriceInverted?.quoteCurrency} opacitySymbol />
            ) : spotPrice === null ? (
              '-'
            ) : (
              <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
            )}
          </styledEl.PriceElement>

          {/* Expires and Created for open orders */}
          <styledEl.CellElement doubleRow>
            <b>{expirationTimeAgo}</b>
            <i>{isScheduledCreating ? 'Creating...' : creationTimeAgo}</i>
          </styledEl.CellElement>
        </>
      ) : (
        <>
          {/* History tab columns */}
          <styledEl.PriceElement onClick={toggleIsInverted}>
            {executedPriceInverted ? (
              <TokenAmount
                amount={executedPriceInverted}
                tokenSymbol={executedPriceInverted?.quoteCurrency}
                opacitySymbol
              />
            ) : (
              '-'
            )}
          </styledEl.PriceElement>

          <styledEl.CellElement>
            {order.status === OrderStatus.FULFILLED && fulfillmentTimeAgo ? fulfillmentTimeAgo : '-'}
          </styledEl.CellElement>

          <styledEl.CellElement>{creationTimeAgo}</styledEl.CellElement>
        </>
      )}

      {/* Filled % */}
      <styledEl.CellElement doubleRow clickable onClick={onClick}>
        <styledEl.FilledPercentageContainer>
          <styledEl.ProgressBar value={filledPercentDisplay}></styledEl.ProgressBar>
          <b>
            <PercentDisplay percent={filledPercentDisplay} />
          </b>
        </styledEl.FilledPercentageContainer>
      </styledEl.CellElement>

      {/* Status label */}
      <styledEl.CellElement>
        <styledEl.StatusBox>
          <OrderStatusBox
            order={order}
            withWarning={withWarning}
            onClick={onClick}
            WarningTooltip={
              withWarning
                ? (props) => (
                    <WarningTooltip
                      hasEnoughBalance={hasEnoughBalance ?? false}
                      hasEnoughAllowance={hasEnoughAllowance ?? false}
                      hasValidPendingPermit={hasValidPendingPermit}
                      inputTokenSymbol={inputTokenSymbol}
                      isOrderScheduled={isOrderScheduled}
                      onApprove={() => orderActions.approveOrderToken(order.inputToken)}
                      showIcon={true}
                      {...props}
                    />
                  )
                : undefined
            }
          />
        </styledEl.StatusBox>
      </styledEl.CellElement>

      {/* Children (e.g. ToggleExpandButton for parent orders) */}
      {children}

      {/* Action content menu */}
      <styledEl.CellElement>
        <OrderContextMenu
          activityUrl={activityUrl}
          openReceipt={onClick}
          showCancellationModal={showCancellationModal}
          alternativeOrderModalContext={alternativeOrderModalContext}
        />
      </styledEl.CellElement>
    </TableRow>
  )
}

/**
 * Helper hook to prepare the parameters to calculate price difference
 */
function usePricesDifference(prices: OrderRowProps['prices'], spotPrice: OrderRowProps['spotPrice']): PriceDifference {
  const { estimatedExecutionPrice } = prices || {}

  return useSafeMemo(() => {
    if (!spotPrice || !estimatedExecutionPrice) return null

    // Calculate price difference using original (non-inverted) prices
    // The percentage should stay the same regardless of display inversion
    return calculatePriceDifference({
      referencePrice: spotPrice,
      targetPrice: estimatedExecutionPrice,
      isInverted: false,
    })
  }, [estimatedExecutionPrice, spotPrice]) // Remove isInverted from dependencies since it shouldn't affect the calculation
}

/**
 * Helper hook to calculate fee amount percentage
 */
function useFeeAmountDifference(
  { inputCurrencyAmount }: OrderRowProps['orderParams']['rateInfoParams'],
  prices: OrderRowProps['prices'],
): Percent | undefined {
  const { feeAmount } = prices || {}

  return useSafeMemo(
    () => calculatePercentageInRelationToReference({ value: feeAmount, reference: inputCurrencyAmount }),
    [feeAmount, inputCurrencyAmount],
  )
}

function getActivityUrl(chainId: SupportedChainId, order: ParsedOrder): string | undefined {
  const { activityId } = order.executionData

  if (getIsComposableCowParentOrder(order)) {
    return undefined
  }

  if (order.composableCowInfo?.isVirtualPart) {
    return undefined
  }

  if (order.status === OrderStatus.SCHEDULED) {
    return undefined
  }

  return chainId && activityId ? getEtherscanLink(chainId, 'transaction', activityId) : undefined
}
