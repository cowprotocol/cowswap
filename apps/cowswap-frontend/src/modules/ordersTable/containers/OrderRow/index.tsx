import { useCallback, useEffect, useMemo, useState } from 'react'

import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, getAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { PercentDisplay, percentIsAlmostHundred, TokenAmount } from '@cowprotocol/ui'
import { useIsSafeWallet } from '@cowprotocol/wallet'
import { Currency, Price } from '@uniswap/sdk-core'

import { OrderStatus } from 'legacy/state/orders/actions'
import { getEstimatedExecutionPrice } from 'legacy/state/orders/utils'

import { PendingOrderPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { BalancesAndAllowances } from 'modules/tokens'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { RateInfo } from 'common/pure/RateInfo'
import { getQuoteCurrency } from 'common/services/getQuoteCurrency'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { OrderContextMenu } from './OrderContextMenu'
import { WarningTooltip } from './OrderWarning'
import * as styledEl from './styled'
import { getActivityUrl, shouldShowDashForExpiration } from './utils'

import { usePricesDifference } from '../../hooks/usePricesDifference'
import { CurrencyAmountItem } from '../../pure/CurrencyAmountItem'
import { OrderFillsAt } from '../../pure/OrderFillsAt'
import { OrderFillsAtWithDistance } from '../../pure/OrderFillsAtWithDistance'
import { OrderMarketPrice } from '../../pure/OrderMarketPrice'
import {
  CheckboxCheckmark,
  TableRow,
  TableRowCheckbox,
  TableRowCheckboxWrapper,
} from '../../pure/OrdersTableContainer/styled'
import { OrderActions } from '../../pure/OrdersTableContainer/types'
import { OrderStatusBox } from '../../pure/OrderStatusBox'
import { WarningEstimatedPrice } from '../../pure/WarningEstimatedPrice'
import { OrderParams } from '../../utils/getOrderParams'

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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
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

  const isInvertedState = useState(() => {
    // On mount, apply smart quote selection
    const quoteCurrency = getQuoteCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
    return getAddress(quoteCurrency) === getAddress(inputCurrencyAmount?.currency)
  })
  const [isInverted, setIsInverted] = isInvertedState
  const toggleIsInverted = useCallback(() => setIsInverted((curr) => !curr), [setIsInverted])

  // Toggle isInverted whenever isGloballyInverted changes
  useEffect(() => {
    toggleIsInverted()
  }, [isGloballyInverted, toggleIsInverted])

  const executedPriceInverted = isInverted ? executedPrice?.invert() : executedPrice

  const priceDiffs = usePricesDifference(estimatedExecutionPrice, spotPrice, isInverted)

  const isExecutedPriceZero = executedPriceInverted !== undefined && executedPriceInverted?.equalTo(ZERO_FRACTION)

  const isUnfillable = !percentIsAlmostHundred(filledPercentDisplay) && (isExecutedPriceZero || withWarning)

  const inputTokenSymbol = order.inputToken.symbol || ''

  const warningText =
    hasEnoughBalance === false
      ? 'Insufficient balance'
      : hasEnoughAllowance === false
        ? 'Insufficient allowance'
        : 'Unfillable'

  const onApprove = withAllowanceWarning ? () => orderActions.approveOrderToken(order.inputToken) : undefined

  const estimatedPriceWarning = withWarning ? (
    <WarningEstimatedPrice
      order={order}
      approveOrderToken={orderActions.approveOrderToken}
      isInverted={isInverted}
      balancesAndAllowances={balancesAndAllowances}
      chainId={chainId}
      withAllowanceWarning={withAllowanceWarning}
      isChild={isChild}
      childOrders={childOrders}
      isTwapTable={isTwapTable}
    />
  ) : undefined

  const orderFillsAt = (
    <OrderFillsAt
      order={order}
      withWarning={withWarning}
      warningText={warningText}
      onApprove={onApprove}
      isInverted={isInverted}
      isUnfillable={isUnfillable}
      estimatedExecutionPrice={estimatedExecutionPrice}
      spotPrice={spotPrice}
      estimatedPriceWarning={estimatedPriceWarning}
      prices={prices}
      priceDiffs={priceDiffs}
      childOrders={childOrders}
      isTwapTable={isTwapTable}
      isChild={isChild}
      isSafeWallet={isSafeWallet}
      rateInfoParams={rateInfoParams}
    />
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
            disabled={getIsNativeToken(order.inputToken) || !isOrderCancellable(order)}
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
      <styledEl.PriceElement>
        <RateInfo
          prependSymbol={false}
          isInvertedState={isInvertedState}
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
          <styledEl.PriceElement onClick={toggleIsInverted}>
            {/*Special case for PRESIGNATURE_PENDING - return just the signing content*/}
            {order.status === OrderStatus.PRESIGNATURE_PENDING ? (
              orderFillsAt
            ) : (
              <OrderFillsAtWithDistance
                order={order}
                withWarning={withWarning}
                warningText={warningText}
                onApprove={onApprove}
                isInverted={isInverted}
                isUnfillable={isUnfillable}
                estimatedExecutionPrice={estimatedExecutionPrice}
                spotPrice={spotPrice}
                estimatedPriceWarning={estimatedPriceWarning}
                priceDiffs={priceDiffs}
                childOrders={childOrders}
                isTwapTable={isTwapTable}
                isChild={isChild}
                orderFillsAt={orderFillsAt}
              />
            )}
          </styledEl.PriceElement>
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
              WarningTooltip={
                <WarningTooltip
                  hasEnoughBalance={hasEnoughBalance ?? false}
                  hasEnoughAllowance={hasEnoughAllowance ?? false}
                  inputTokenSymbol={inputTokenSymbol}
                  isOrderScheduled={isOrderScheduled}
                  onApprove={() => orderActions.approveOrderToken(order.inputToken)}
                />
              }
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
