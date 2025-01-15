import React, { useCallback, useEffect, useMemo, useState } from 'react'

import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, getAddress, getEtherscanLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command, UiOrderType } from '@cowprotocol/types'
import { HoverTooltip, Loader, PercentDisplay, percentIsAlmostHundred, TokenAmount, UI } from '@cowprotocol/ui'
import { useIsSafeWallet } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

import { Check, Clock, X, Zap } from 'react-feather'
import SVG from 'react-inlinesvg'

import { OrderStatus } from 'legacy/state/orders/actions'

import { PendingOrderPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'

import {
  FAIR_PRICE_THRESHOLD_PERCENTAGE,
  GOOD_PRICE_THRESHOLD_PERCENTAGE,
  PENDING_EXECUTION_THRESHOLD_PERCENTAGE,
} from 'common/constants/common'
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

// Helper to determine the color based on percentage
function getDistanceColor(percentage: number): string {
  const absPercentage = Math.abs(percentage)

  if (absPercentage <= GOOD_PRICE_THRESHOLD_PERCENTAGE) {
    return `var(${UI.COLOR_SUCCESS})` // Green - good price
  } else if (absPercentage <= FAIR_PRICE_THRESHOLD_PERCENTAGE) {
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
  isHistoryTab: boolean
  isRowSelectable: boolean
  isRowSelected: boolean
  isChild?: boolean
  isExpanded?: boolean
  orderParams: OrderParams
  onClick: Command
  orderActions: OrderActions
  children?: React.ReactNode
  isTwapTable?: boolean
}

export function OrderRow({
  order,
  isRateInverted: isGloballyInverted,
  isHistoryTab,
  isRowSelectable,
  isRowSelected,
  isChild,
  isExpanded,
  orderActions,
  orderParams,
  onClick,
  prices,
  spotPrice,
  children,
  isTwapTable,
}: OrderRowProps) {
  const { buyAmount, rateInfoParams, hasEnoughAllowance, hasEnoughBalance, chainId } = orderParams
  const { creationTime, expirationTime, status } = order
  const { filledPercentDisplay, executedPrice } = order.executionData
  const { inputCurrencyAmount, outputCurrencyAmount } = rateInfoParams
  const { estimatedExecutionPrice, feeAmount } = prices || {}
  const isSafeWallet = useIsSafeWallet()

  const showCancellationModal = useMemo(() => {
    return orderActions.getShowCancellationModal(order)
  }, [orderActions, order])
  const alternativeOrderModalContext = useMemo(
    () => orderActions.getAlternativeOrderModalContext(order),
    [order, orderActions],
  )

  const withAllowanceWarning = hasEnoughAllowance === false
  const withWarning =
    (hasEnoughBalance === false || withAllowanceWarning) &&
    // show the warning only for pending and scheduled orders, but not for presignature pending
    status !== OrderStatus.PRESIGNATURE_PENDING &&
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

  const inputTokenSymbol = order.inputToken.symbol || ''

  const getWarningText = () => {
    if (hasEnoughBalance === false) return 'Insufficient balance'
    if (hasEnoughAllowance === false) return 'Insufficient allowance'
    return 'Unfillable'
  }

  const renderWarningTooltip =
    (showIcon?: boolean) =>
    ({ children }: { children: React.ReactNode }) => (
      <WarningTooltip
        hasEnoughBalance={hasEnoughBalance ?? false}
        hasEnoughAllowance={hasEnoughAllowance ?? false}
        inputTokenSymbol={inputTokenSymbol}
        isOrderScheduled={isOrderScheduled}
        onApprove={() => orderActions.approveOrderToken(order.inputToken)}
        showIcon={showIcon}
        children={children}
      />
    )

  const renderLimitPrice = () => (
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
  )

  const renderFillsAt = () => (
    <>
      {getIsFinalizedOrder(order) ? (
        order.status === OrderStatus.CANCELLED ? (
          <styledEl.CancelledDisplay>
            <X size={14} strokeWidth={2.5} />
            Order cancelled
          </styledEl.CancelledDisplay>
        ) : order.status === OrderStatus.FULFILLED ? (
          <styledEl.FilledDisplay>
            <Check size={14} strokeWidth={3.5} />
            Order {order.partiallyFillable && Number(filledPercentDisplay) < 100 ? 'partially ' : ''}filled
          </styledEl.FilledDisplay>
        ) : order.status === OrderStatus.EXPIRED ? (
          <styledEl.ExpiredDisplay>
            <Clock size={14} strokeWidth={2.5} />
            Order expired
          </styledEl.ExpiredDisplay>
        ) : isUnfillable ? (
          ''
        ) : (
          '-'
        )
      ) : order.status === OrderStatus.PRESIGNATURE_PENDING ? (
        <styledEl.ExecuteCellWrapper>
          <HoverTooltip
            wrapInContainer={true}
            content={
              <div>
                This order needs to be signed and executed with your {isSafeWallet ? 'Safe' : 'Smart contract'} wallet
              </div>
            }
          >
            <styledEl.SigningDisplay>
              <SVG src={orderPresignaturePending} description="signing" />
              Please sign order
            </styledEl.SigningDisplay>
          </HoverTooltip>
        </styledEl.ExecuteCellWrapper>
      ) : prices && estimatedExecutionPrice ? (
        <styledEl.ExecuteCellWrapper>
          {!isUnfillable &&
          priceDiffs?.percentage &&
          Math.abs(Number(priceDiffs.percentage.toFixed(4))) <= PENDING_EXECUTION_THRESHOLD_PERCENTAGE ? (
            <HoverTooltip
              wrapInContainer={true}
              content={
                <div>
                  The fill price of this order is close or at the market price (
                  <b>
                    fills at{' '}
                    <TokenAmount amount={executionPriceInverted} tokenSymbol={executionPriceInverted?.quoteCurrency} />
                  </b>
                  , {priceDiffs.percentage.toFixed(2)}% from market) and is expected to{' '}
                  {!percentIsAlmostHundred(filledPercentDisplay) ? 'partially' : ''} fill soon
                </div>
              }
            >
              <styledEl.PendingExecutionDisplay>
                <Zap size={14} strokeWidth={2.5} />
                Pending execution
              </styledEl.PendingExecutionDisplay>
            </HoverTooltip>
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
              WarningTooltip={renderWarningTooltip(true)}
              onApprove={withAllowanceWarning ? () => orderActions.approveOrderToken(order.inputToken) : undefined}
            />
          )}
        </styledEl.ExecuteCellWrapper>
      ) : (
        '-'
      )}
    </>
  )

  const renderFillsAtWithDistance = () => {
    // Special case for PRESIGNATURE_PENDING - return just the signing content
    if (order.status === OrderStatus.PRESIGNATURE_PENDING) {
      return renderFillsAt()
    }

    // For TWAP parent orders, show the next scheduled child order's fills at price
    if (children) {
      // Get the next scheduled order from the children prop
      const childrenArray = React.Children.toArray(children) as React.ReactElement<{ order: ParsedOrder }>[]
      const nextScheduledOrder = childrenArray
        .map((child) => child.props.order)
        .find((childOrder) => {
          return childOrder && childOrder.status === OrderStatus.SCHEDULED && !getIsFinalizedOrder(childOrder)
        })

      if (nextScheduledOrder) {
        // Get the execution price from the next scheduled order
        const nextOrderExecutionPrice = nextScheduledOrder.executionData.executedPrice
        const nextOrderPriceDiffs = calculatePriceDifference({
          referencePrice: spotPrice,
          targetPrice: nextOrderExecutionPrice,
          isInverted: false,
        })

        // Show the execution price for the next scheduled order
        let nextOrderFillsAtContent
        if (nextScheduledOrder.status === OrderStatus.CANCELLED || nextScheduledOrder.isUnfillable) {
          nextOrderFillsAtContent = ''
        } else if (!nextOrderExecutionPrice || nextScheduledOrder.status === OrderStatus.CREATING) {
          nextOrderFillsAtContent = '-'
        } else {
          nextOrderFillsAtContent = (
            <TokenAmount
              amount={nextOrderExecutionPrice}
              tokenSymbol={nextOrderExecutionPrice?.quoteCurrency}
              opacitySymbol
            />
          )
        }

        const nextOrderDistance = nextOrderPriceDiffs?.percentage
          ? `${nextOrderPriceDiffs.percentage.toFixed(2)}%`
          : '-'

        return (
          <styledEl.CellElement doubleRow>
            <b>{nextOrderFillsAtContent}</b>
            <i
              style={{
                color: !isUnfillable
                  ? getDistanceColor(Number(nextOrderPriceDiffs?.percentage?.toFixed(4) || '0'))
                  : 'inherit',
              }}
            >
              {nextOrderDistance}
            </i>
          </styledEl.CellElement>
        )
      }

      // If no scheduled orders found, show dash
      return (
        <styledEl.CellElement>
          <b>-</b>
        </styledEl.CellElement>
      )
    }

    // Regular order display logic
    const fillsAtContent = renderFillsAt()
    const distance =
      getIsFinalizedOrder(order) ||
      order.status === OrderStatus.CANCELLED ||
      isUnfillable ||
      (priceDiffs?.percentage &&
        Math.abs(Number(priceDiffs.percentage.toFixed(4))) <= PENDING_EXECUTION_THRESHOLD_PERCENTAGE)
        ? ''
        : priceDiffs?.percentage
          ? `${priceDiffs?.percentage.toFixed(2)}%`
          : '-'

    return (
      <styledEl.CellElement doubleRow>
        <b>{fillsAtContent}</b>
        <i
          style={{
            color: !isUnfillable ? getDistanceColor(Number(priceDiffs?.percentage?.toFixed(4) || '0')) : 'inherit',
          }}
        >
          {distance}
        </i>
      </styledEl.CellElement>
    )
  }

  const renderMarketPrice = () => (
    <>
      {children ? (
        '-'
      ) : order.status === OrderStatus.CANCELLED || withWarning || order.status === OrderStatus.PRESIGNATURE_PENDING ? (
        '-'
      ) : spotPrice ? (
        <TokenAmount
          amount={spotPriceInverted}
          tokenSymbol={spotPriceInverted?.quoteCurrency}
          opacitySymbol
          clickable
          noTitle
        />
      ) : spotPrice === null ? (
        '-'
      ) : (
        <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
      )}
    </>
  )

  return (
    <TableRow
      data-id={order.id}
      isChildOrder={isChild}
      isHistoryTab={isHistoryTab}
      isRowSelectable={isRowSelectable}
      isTwapTable={isTwapTable}
      isExpanded={isExpanded}
    >
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
          <styledEl.PriceElement onClick={toggleIsInverted}>{renderLimitPrice()}</styledEl.PriceElement>
          <styledEl.PriceElement onClick={toggleIsInverted}>{renderFillsAtWithDistance()}</styledEl.PriceElement>
          <styledEl.PriceElement onClick={toggleIsInverted}>{renderMarketPrice()}</styledEl.PriceElement>

          {/* Expires and Created for open orders */}
          <styledEl.CellElement doubleRow>
            <b
              title={
                expirationTime && !shouldShowDashForExpiration(order)
                  ? formatDateWithTimezone(expirationTime)
                  : undefined
              }
            >
              {shouldShowDashForExpiration(order) ? '-' : expirationTimeAgo}
            </b>
            <i title={creationTime && !isScheduledCreating ? formatDateWithTimezone(creationTime) : undefined}>
              {isScheduledCreating ? 'Creating...' : creationTimeAgo}
            </i>
          </styledEl.CellElement>
        </>
      ) : (
        <>
          {/* History tab columns */}
          {/* Limit price */}
          <styledEl.PriceElement onClick={toggleIsInverted}>
            <RateInfo
              prependSymbol={false}
              isInvertedState={[isInverted, setIsInverted]}
              noLabel={true}
              doNotUseSmartQuote
              isInverted={isInverted}
              rateInfoParams={rateInfoParams}
              opacitySymbol={true}
            />
          </styledEl.PriceElement>

          {/* Execution price */}
          <styledEl.PriceElement onClick={toggleIsInverted}>
            {executedPriceInverted ? (
              <TokenAmount
                amount={executedPriceInverted}
                tokenSymbol={executedPriceInverted?.quoteCurrency}
                opacitySymbol
                clickable
                noTitle
              />
            ) : (
              '-'
            )}
          </styledEl.PriceElement>

          <styledEl.CellElement>
            {order.status === OrderStatus.FULFILLED && fulfillmentTimeAgo ? (
              <span title={order.fulfillmentTime ? formatDateWithTimezone(new Date(order.fulfillmentTime)) : undefined}>
                {fulfillmentTimeAgo}
              </span>
            ) : (
              '-'
            )}
          </styledEl.CellElement>

          <styledEl.CellElement>
            <span title={creationTime ? formatDateWithTimezone(creationTime) : undefined}>{creationTimeAgo}</span>
          </styledEl.CellElement>
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
      {!children && (
        <styledEl.CellElement>
          <styledEl.StatusBox>
            <OrderStatusBox
              order={order}
              withWarning={withWarning}
              onClick={onClick}
              WarningTooltip={withWarning ? renderWarningTooltip(true) : undefined}
            />
          </styledEl.StatusBox>
        </styledEl.CellElement>
      )}

      {/* Children (e.g. ToggleExpandButton for parent orders) */}
      {children}

      {/* Add empty cell for child TWAP orders */}
      {isTwapTable && isChild && <styledEl.CellElement />}

      {/* Add empty cell for signing orders */}
      {order.status === OrderStatus.PRESIGNATURE_PENDING && <styledEl.CellElement />}

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

function shouldShowDashForExpiration(order: ParsedOrder): boolean {
  // Show dash for finalized orders that are not expired
  if (getIsFinalizedOrder(order) && order.status !== OrderStatus.EXPIRED) {
    return true
  }

  // For TWAP parent orders, show dash when all child orders are in a final state
  if (getIsComposableCowParentOrder(order)) {
    // If the parent order is fulfilled or cancelled, all child orders are finalized
    if (order.status === OrderStatus.FULFILLED || order.status === OrderStatus.CANCELLED) {
      return true
    }

    // For mixed states (some filled, some expired), check either condition:
    // 1. fullyFilled: true when all non-expired parts are filled
    // 2. status === EXPIRED: true when all remaining parts are expired
    // Either condition indicates all child orders are in a final state
    if (order.executionData.fullyFilled || order.status === OrderStatus.EXPIRED) {
      return true
    }
  }

  return false
}
