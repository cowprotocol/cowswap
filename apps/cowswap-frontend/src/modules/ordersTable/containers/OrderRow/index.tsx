import React, { useCallback, useEffect, useMemo, useState } from 'react'

import orderPresignaturePending from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, getAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command, UiOrderType } from '@cowprotocol/types'
import { HoverTooltip, PercentDisplay, percentIsAlmostHundred, TokenAmount } from '@cowprotocol/ui'
import { useIsSafeWallet } from '@cowprotocol/wallet'
import { Currency, Price } from '@uniswap/sdk-core'

import { Check, Clock, X, Zap } from 'react-feather'
import SVG from 'react-inlinesvg'

import { OrderStatus } from 'legacy/state/orders/actions'
import { getEstimatedExecutionPrice } from 'legacy/state/orders/utils'

import { PendingOrderPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { BalancesAndAllowances } from 'modules/tokens'

import { PENDING_EXECUTION_THRESHOLD_PERCENTAGE } from 'common/constants/common'
import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { RateInfo } from 'common/pure/RateInfo'
import { getQuoteCurrency } from 'common/services/getQuoteCurrency'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'
import { calculatePriceDifference } from 'utils/orderUtils/calculatePriceDifference'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { EstimatedExecutionPrice } from './EstimatedExecutionPrice'
import { OrderContextMenu } from './OrderContextMenu'
import { WarningTooltip } from './OrderWarning'
import * as styledEl from './styled'
import { getActivityUrl, getDistanceColor, shouldShowDashForExpiration } from './utils'

import { useFeeAmountDifference } from '../../hooks/useFeeAmountDifference'
import { usePricesDifference } from '../../hooks/usePricesDifference'
import { CurrencyAmountItem } from '../../pure/CurrencyAmountItem'
import { OrderMarketPrice } from '../../pure/OrderMarketPrice'
import {
  CheckboxCheckmark,
  TableRow,
  TableRowCheckbox,
  TableRowCheckboxWrapper,
} from '../../pure/OrdersTableContainer/styled'
import { OrderActions } from '../../pure/OrdersTableContainer/types'
import { OrderStatusBox } from '../../pure/OrderStatusBox'
import { getOrderParams, OrderParams } from '../../utils/getOrderParams'

// Constants
const TIME_AGO_UPDATE_INTERVAL = 3000

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
  childOrders?: ParsedOrder[]
  isTwapTable?: boolean
  chainId: SupportedChainId
  balancesAndAllowances: BalancesAndAllowances
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
  childOrders,
  isTwapTable,
  chainId,
  balancesAndAllowances,
}: OrderRowProps) {
  const { buyAmount, rateInfoParams, hasEnoughAllowance, hasEnoughBalance } = orderParams
  const { creationTime, expirationTime, status } = order
  const { filledPercentDisplay, executedPrice } = order.executionData
  const { inputCurrencyAmount, outputCurrencyAmount } = rateInfoParams
  const { feeAmount } = prices || {}
  const estimatedExecutionPrice = useSafeMemo(() => {
    return spotPrice && feeAmount && getEstimatedExecutionPrice(order, spotPrice, feeAmount.quotient.toString())
  }, [spotPrice, feeAmount, order])
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

  const priceDiffs = usePricesDifference(estimatedExecutionPrice, spotPrice, isInverted)
  const feeDifference = useFeeAmountDifference(rateInfoParams, prices)

  const isExecutedPriceZero = executedPriceInverted !== undefined && executedPriceInverted?.equalTo(ZERO_FRACTION)

  const isUnfillable = !percentIsAlmostHundred(filledPercentDisplay) && (isExecutedPriceZero || withWarning)

  const inputTokenSymbol = order.inputToken.symbol || ''

  const warningText =
    hasEnoughBalance === false
      ? 'Insufficient balance'
      : hasEnoughAllowance === false
        ? 'Insufficient allowance'
        : 'Unfillable'

  const renderWarningTooltip = () => (props: { children: React.ReactNode }) => (
    <WarningTooltip
      hasEnoughBalance={hasEnoughBalance ?? false}
      hasEnoughAllowance={hasEnoughAllowance ?? false}
      inputTokenSymbol={inputTokenSymbol}
      isOrderScheduled={isOrderScheduled}
      onApprove={() => orderActions.approveOrderToken(order.inputToken)}
      {...props}
    />
  )

  const areAllChildOrdersCancelled = (orders: ParsedOrder[] | undefined): boolean => {
    if (!orders || orders.length === 0) return false
    return orders.every((order) => order.status === OrderStatus.CANCELLED)
  }

  const findWarningChildWithParams = () => {
    if (!isTwapTable || isChild || !childOrders) return null

    for (const childOrder of childOrders) {
      if (
        childOrder.status !== OrderStatus.FULFILLED &&
        (childOrder.status === OrderStatus.SCHEDULED || childOrder.status === OrderStatus.PENDING)
      ) {
        const childParams = getOrderParams(chainId, balancesAndAllowances, childOrder)
        if (childParams?.hasEnoughBalance === false || childParams?.hasEnoughAllowance === false) {
          return { order: childOrder, params: childParams }
        }
      }
    }
    return null
  }

  const renderWarningEstimatedPrice = (warningChildWithParams: ReturnType<typeof findWarningChildWithParams>) => {
    return (
      <styledEl.ExecuteCellWrapper>
        <EstimatedExecutionPrice
          amount={undefined}
          tokenSymbol={undefined}
          isInverted={isInverted}
          isUnfillable={true}
          canShowWarning={true}
          warningText={
            warningChildWithParams?.params
              ? warningChildWithParams.params.hasEnoughAllowance === false
                ? 'Insufficient allowance'
                : warningChildWithParams.params.hasEnoughBalance === false
                  ? 'Insufficient balance'
                  : 'Unfillable'
              : warningText
          }
          WarningTooltip={renderWarningTooltip()}
          onApprove={
            warningChildWithParams?.params?.hasEnoughAllowance === false
              ? () => orderActions.approveOrderToken(warningChildWithParams.order.inputToken)
              : withAllowanceWarning
                ? () => orderActions.approveOrderToken(order.inputToken)
                : undefined
          }
        />
      </styledEl.ExecuteCellWrapper>
    )
  }

  const renderFillsAt = () => {
    // Check for signing state first, regardless of order type
    if (order.status === OrderStatus.PRESIGNATURE_PENDING) {
      return (
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
      )
    }

    // For TWAP parent orders
    if (isTwapTable && !isChild && childOrders) {
      // First priority: Check for warnings - MUST check child orders first
      const warningChildWithParams = findWarningChildWithParams()

      if (warningChildWithParams || withWarning) {
        return renderWarningEstimatedPrice(warningChildWithParams)
      }

      // Second priority: Check for cancelled state
      if (areAllChildOrdersCancelled(childOrders)) {
        return (
          <styledEl.CellElement doubleRow>
            <b>
              <styledEl.CancelledDisplay>
                <X size={14} strokeWidth={2.5} />
                Order cancelled
              </styledEl.CancelledDisplay>
            </b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      // Third priority: Check for scheduled orders
      const hasScheduledOrder = childOrders.some((childOrder) => childOrder.status === OrderStatus.SCHEDULED)

      if (hasScheduledOrder) {
        return (
          <styledEl.CellElement doubleRow>
            <b>-</b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      // Fourth priority: Check for filled states
      const allChildrenFilled = childOrders.every(
        (childOrder) =>
          childOrder.status === OrderStatus.FULFILLED && Number(childOrder.executionData.filledPercentDisplay) >= 99.99,
      )

      if (allChildrenFilled) {
        return (
          <styledEl.CellElement doubleRow>
            <b>
              <styledEl.FilledDisplay>
                <Check size={14} strokeWidth={3.5} />
                Order filled
              </styledEl.FilledDisplay>
            </b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      const hasFilledOrders = childOrders.some(
        (childOrder) =>
          childOrder.status === OrderStatus.FULFILLED && Number(childOrder.executionData.filledPercentDisplay) > 0,
      )

      if (hasFilledOrders) {
        return (
          <styledEl.CellElement doubleRow>
            <b>
              <styledEl.FilledDisplay>
                <Check size={14} strokeWidth={3.5} />
                Order partially filled
              </styledEl.FilledDisplay>
            </b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      // Fifth priority: Check for expired state
      const allChildrenExpired = childOrders.every((childOrder) => childOrder.status === OrderStatus.EXPIRED)

      if (allChildrenExpired || order.status === OrderStatus.EXPIRED) {
        return (
          <styledEl.CellElement doubleRow>
            <b>
              <styledEl.ExpiredDisplay>
                <Clock size={14} strokeWidth={2.5} />
                Order expired
              </styledEl.ExpiredDisplay>
            </b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      return '-'
    }

    // Regular order status handling
    if (getIsFinalizedOrder(order)) {
      // Check filled status first
      if (Number(filledPercentDisplay) > 0) {
        return (
          <styledEl.FilledDisplay>
            <Check size={14} strokeWidth={3.5} />
            Order {Number(filledPercentDisplay) < 100 ? 'partially ' : ''}filled
          </styledEl.FilledDisplay>
        )
      }

      // Then check cancelled status
      if (order.status === OrderStatus.CANCELLED) {
        return (
          <styledEl.CancelledDisplay>
            <X size={14} strokeWidth={2.5} />
            Order cancelled
          </styledEl.CancelledDisplay>
        )
      }

      if (order.status === OrderStatus.EXPIRED) {
        return (
          <styledEl.ExpiredDisplay>
            <Clock size={14} strokeWidth={2.5} />
            Order expired
          </styledEl.ExpiredDisplay>
        )
      }

      if (isUnfillable) {
        return ''
      }

      return '-'
    }

    if (estimatedExecutionPrice && !estimatedExecutionPrice.equalTo(ZERO_FRACTION)) {
      return (
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
              marketPrice={spotPriceInverted}
              executesAtPrice={executionPriceInverted}
              amountFee={feeAmount}
              canShowWarning={getUiOrderType(order) !== UiOrderType.SWAP && !isUnfillable}
              isUnfillable={withWarning}
              warningText={warningText}
              WarningTooltip={renderWarningTooltip()}
              onApprove={withAllowanceWarning ? () => orderActions.approveOrderToken(order.inputToken) : undefined}
            />
          )}
        </styledEl.ExecuteCellWrapper>
      )
    }

    return '-'
  }

  const renderFillsAtWithDistance = () => {
    // Special case for PRESIGNATURE_PENDING - return just the signing content
    if (order.status === OrderStatus.PRESIGNATURE_PENDING) {
      return renderFillsAt()
    }

    // For TWAP parent orders
    if (isTwapTable && !isChild && childOrders) {
      // First priority: Check for warnings - MUST check child orders first
      const warningChildWithParams = findWarningChildWithParams()

      if (warningChildWithParams || withWarning) {
        return renderWarningEstimatedPrice(warningChildWithParams)
      }

      // Second priority: Check for cancelled state
      if (areAllChildOrdersCancelled(childOrders)) {
        return (
          <styledEl.CellElement doubleRow>
            <b>
              <styledEl.CancelledDisplay>
                <X size={14} strokeWidth={2.5} />
                Order cancelled
              </styledEl.CancelledDisplay>
            </b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      // Third priority: Check for scheduled orders
      const hasScheduledOrder = childOrders.some((childOrder) => childOrder.status === OrderStatus.SCHEDULED)

      if (hasScheduledOrder) {
        return (
          <styledEl.CellElement doubleRow>
            <b>-</b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      // Fourth priority: Check for filled states
      const allChildrenFilled = childOrders.every(
        (childOrder) =>
          childOrder.status === OrderStatus.FULFILLED && Number(childOrder.executionData.filledPercentDisplay) >= 99.99,
      )

      if (allChildrenFilled) {
        return (
          <styledEl.CellElement doubleRow>
            <b>
              <styledEl.FilledDisplay>
                <Check size={14} strokeWidth={3.5} />
                Order filled
              </styledEl.FilledDisplay>
            </b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      const hasFilledOrders = childOrders.some(
        (childOrder) =>
          childOrder.status === OrderStatus.FULFILLED && Number(childOrder.executionData.filledPercentDisplay) > 0,
      )

      if (hasFilledOrders) {
        return (
          <styledEl.CellElement doubleRow>
            <b>
              <styledEl.FilledDisplay>
                <Check size={14} strokeWidth={3.5} />
                Order partially filled
              </styledEl.FilledDisplay>
            </b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      // Fifth priority: Check for expired state
      const allChildrenExpired = childOrders.every((childOrder) => childOrder.status === OrderStatus.EXPIRED)

      if (allChildrenExpired || order.status === OrderStatus.EXPIRED) {
        return (
          <styledEl.CellElement doubleRow>
            <b>
              <styledEl.ExpiredDisplay>
                <Clock size={14} strokeWidth={2.5} />
                Order expired
              </styledEl.ExpiredDisplay>
            </b>
            <i></i>
          </styledEl.CellElement>
        )
      }

      // If no aggregate state, check for next scheduled order
      const nextScheduledOrder = childOrders.find(
        (childOrder) => childOrder.status === OrderStatus.SCHEDULED && !getIsFinalizedOrder(childOrder),
      )

      if (nextScheduledOrder) {
        // For scheduled orders, use the execution price if available, otherwise use the estimated price from props
        const nextOrderExecutionPrice = nextScheduledOrder.executionData.executedPrice || estimatedExecutionPrice
        const nextOrderPriceDiffs = nextOrderExecutionPrice
          ? calculatePriceDifference({
              referencePrice: spotPrice,
              targetPrice: nextOrderExecutionPrice,
              isInverted: false,
            })
          : null

        // Show the execution price for the next scheduled order
        let nextOrderFillsAtContent
        if (nextScheduledOrder.status === OrderStatus.CANCELLED || nextScheduledOrder.isUnfillable) {
          nextOrderFillsAtContent = ''
        } else if (!nextOrderExecutionPrice || nextScheduledOrder.status === OrderStatus.CREATING) {
          nextOrderFillsAtContent = '-'
        } else {
          nextOrderFillsAtContent = (
            <TokenAmount
              amount={isInverted ? nextOrderExecutionPrice.invert() : nextOrderExecutionPrice}
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
                color:
                  !isUnfillable && nextOrderPriceDiffs?.percentage
                    ? getDistanceColor(Number(nextOrderPriceDiffs.percentage.toFixed(4)))
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
        <styledEl.CellElement doubleRow>
          <b>-</b>
          <i></i>
        </styledEl.CellElement>
      )
    }

    // Regular order display logic (including child orders)
    if (withWarning || isUnfillable) {
      return (
        <styledEl.ExecuteCellWrapper>
          <EstimatedExecutionPrice
            amount={undefined}
            tokenSymbol={undefined}
            isInverted={isInverted}
            isUnfillable={true}
            canShowWarning={true}
            warningText={
              hasEnoughBalance === false
                ? 'Insufficient balance'
                : hasEnoughAllowance === false
                  ? 'Insufficient allowance'
                  : 'Unfillable'
            }
            WarningTooltip={renderWarningTooltip()}
            onApprove={withAllowanceWarning ? () => orderActions.approveOrderToken(order.inputToken) : undefined}
          />
        </styledEl.ExecuteCellWrapper>
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
            color:
              !isUnfillable && priceDiffs?.percentage
                ? getDistanceColor(Number(priceDiffs.percentage.toFixed(4)))
                : 'inherit',
          }}
        >
          {distance}
        </i>
      </styledEl.CellElement>
    )
  }

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
          <TokenLogo token={order.inputToken} size={28} />
          <TokenLogo token={buyAmount.currency} size={28} />
        </styledEl.CurrencyLogoPair>
        <styledEl.CurrencyAmountWrapper clickable onClick={onClick}>
          <CurrencyAmountItem amount={getSellAmountWithFee(order)} />
          <CurrencyAmountItem amount={buyAmount} />
        </styledEl.CurrencyAmountWrapper>
      </styledEl.CurrencyCell>

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

      {/* Non-history tab columns */}
      {!isHistoryTab ? (
        <>
          <styledEl.PriceElement onClick={toggleIsInverted}>{renderFillsAtWithDistance()}</styledEl.PriceElement>
          <styledEl.PriceElement onClick={toggleIsInverted}>
            <OrderMarketPrice
              order={order}
              withWarning={withWarning}
              childOrders={childOrders}
              isTwapTable={isTwapTable}
              spotPrice={spotPrice}
              isChild={isChild}
              isInverted={isInverted}
            />
          </styledEl.PriceElement>

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
              WarningTooltip={withWarning ? renderWarningTooltip() : undefined}
            />
          </styledEl.StatusBox>
        </styledEl.CellElement>
      )}

      {/* Children (e.g. ToggleExpandButton for parent orders) */}
      {children}

      {/* Add empty cell for child TWAP orders */}
      {isTwapTable && isChild && <styledEl.CellElement />}

      {/* Add empty cell for signing orders - only for TWAP */}
      {isTwapTable && order.status === OrderStatus.PRESIGNATURE_PENDING && <styledEl.CellElement />}

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
