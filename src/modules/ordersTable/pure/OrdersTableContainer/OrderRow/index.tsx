import React, { useCallback, useContext, useEffect, useState } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'
import { ThemeContext } from 'styled-components/macro'

import AlertTriangle from 'legacy/assets/cow-swap/alert.svg'
import Loader from 'legacy/components/Loader'
import { MouseoverTooltipContent } from 'legacy/components/Tooltip'
import { ZERO_FRACTION } from 'legacy/constants'
import useTimeAgo from 'legacy/hooks/useTimeAgo'
import { CREATING_STATES, OrderStatus, PENDING_STATES } from 'legacy/state/orders/actions'
import { getEtherscanLink } from 'legacy/utils'

import { PendingOrderPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { EstimatedExecutionPrice } from 'modules/ordersTable/pure/OrdersTableContainer/OrderRow/EstimatedExecutionPrice'
import { OrderContextMenu } from 'modules/ordersTable/pure/OrdersTableContainer/OrderRow/OrderContextMenu'
import {
  TableRow,
  TableRowCheckbox,
  TableRowCheckboxWrapper,
  CheckboxCheckmark,
} from 'modules/ordersTable/pure/OrdersTableContainer/styled'
import { LimitOrderActions } from 'modules/ordersTable/pure/OrdersTableContainer/types'
import { OrderStatusBox } from 'modules/ordersTable/pure/OrderStatusBox'
import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { CurrencyLogo } from 'common/pure/CurrencyLogo'
import { RateInfo } from 'common/pure/RateInfo'
import { TokenAmount } from 'common/pure/TokenAmount'
import { TokenSymbol } from 'common/pure/TokenSymbol'
import { getQuoteCurrency } from 'common/services/getQuoteCurrency'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'
import { getAddress } from 'utils/getAddress'
import { calculatePercentageInRelationToReference } from 'utils/orderUtils/calculatePercentageInRelationToReference'
import { calculatePriceDifference, PriceDifference } from 'utils/orderUtils/calculatePriceDifference'
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

import { OrderParams } from '../utils/getOrderParams'

export const orderStatusTitleMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: 'Open',
  [OrderStatus.PRESIGNATURE_PENDING]: 'Signing',
  [OrderStatus.FULFILLED]: 'Filled',
  [OrderStatus.EXPIRED]: 'Expired',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.CREATING]: 'Creating',
  [OrderStatus.FAILED]: 'Failed',
}

const TIME_AGO_UPDATE_INTERVAL = 3000

function CurrencyAmountItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return (
    <styledEl.AmountItem title={amount.toExact() + ' ' + amount.currency.symbol}>
      <TokenAmount amount={amount} tokenSymbol={amount.currency} />
    </styledEl.AmountItem>
  )
}

function CurrencySymbolItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return <CurrencyLogo currency={amount.currency} size="28px" />
}

const BalanceWarning = (symbol: string) => (
  <styledEl.WarningParagraph>
    <h3>Insufficient balance</h3>
    <p>
      Your wallet currently has insufficient{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>{' '}
      balance to execute this order.
      <br />
      <br />
      The order is still open and will become executable when you top up your{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>{' '}
      balance.
    </p>
  </styledEl.WarningParagraph>
)

const AllowanceWarning = (symbol: string) => (
  <styledEl.WarningParagraph>
    <h3>Insufficient approval for this order</h3>
    <p>
      This order is still open and valid, but you haven’t given CoW Swap sufficient allowance to spend{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>
      .
      <br />
      The order will become executable when you approve{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>{' '}
      in your account token page.
    </p>
  </styledEl.WarningParagraph>
)

export interface OrderRowProps {
  order: ParsedOrder
  prices: PendingOrderPrices | undefined | null
  spotPrice: Price<Currency, Currency> | undefined | null
  isRateInverted: boolean
  isOpenOrdersTab: boolean
  isRowSelectable: boolean
  isRowSelected: boolean
  orderParams: OrderParams
  onClick: () => void
  orderActions: LimitOrderActions
}

export function OrderRow({
  order,
  isRateInverted: isGloballyInverted,
  isOpenOrdersTab,
  isRowSelectable,
  isRowSelected,
  orderActions,
  orderParams,
  onClick,
  prices,
  spotPrice,
}: OrderRowProps) {
  const { buyAmount, rateInfoParams, hasEnoughAllowance, hasEnoughBalance, chainId } = orderParams
  const { creationTime, expirationTime, status } = order
  const { filledPercentDisplay, executedPrice, activityId } = order.executionData
  const { inputCurrencyAmount, outputCurrencyAmount } = rateInfoParams
  const { estimatedExecutionPrice, feeAmount } = prices || {}

  const showCancellationModal = orderActions.getShowCancellationModal(order)

  const withWarning =
    (!hasEnoughBalance || !hasEnoughAllowance) &&
    // don't show the warning for closed orders
    PENDING_STATES.includes(status)
  const theme = useContext(ThemeContext)

  const expirationTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const creationTimeAgo = useTimeAgo(creationTime, TIME_AGO_UPDATE_INTERVAL)
  // TODO: set the real value when API returns it
  // const executedTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const activityUrl = chainId && activityId ? getEtherscanLink(chainId, activityId, 'transaction') : undefined

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

  const priceDiffs = usePricesDifference(prices, spotPrice, isInverted)
  const feeDifference = useFeeAmountDifference(rateInfoParams, prices)

  const isUnfillable =
    (executedPriceInverted !== undefined && executedPriceInverted?.equalTo(ZERO_FRACTION)) || withWarning
  const isOrderCreating = CREATING_STATES.includes(order.status)

  return (
    <TableRow data-id={order.id} isOpenOrdersTab={isOpenOrdersTab} isRowSelectable={isRowSelectable}>
      {/*Checkbox for multiple cancellation*/}
      {isRowSelectable && isOpenOrdersTab && (
        <TableRowCheckboxWrapper>
          <TableRowCheckbox
            type="checkbox"
            checked={isRowSelected}
            disabled={getIsEthFlowOrder(order) || !isOrderCancellable(order)}
            onChange={() => orderActions.toggleOrderForCancellation(order)}
          />
          <CheckboxCheckmark />
        </TableRowCheckboxWrapper>
      )}
      {/* Order sell/buy tokens */}
      <styledEl.CurrencyCell clickable onClick={onClick}>
        <styledEl.CurrencyLogoPair>
          <CurrencySymbolItem amount={getSellAmountWithFee(order)} />
          <CurrencySymbolItem amount={buyAmount} />
        </styledEl.CurrencyLogoPair>
        <styledEl.CurrencyAmountWrapper>
          <CurrencyAmountItem amount={getSellAmountWithFee(order)} />
          <CurrencyAmountItem amount={buyAmount} />
        </styledEl.CurrencyAmountWrapper>
      </styledEl.CurrencyCell>

      {/* Limit price */}
      <styledEl.CellElement>
        <styledEl.RateValue>
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
      </styledEl.CellElement>

      {/* Market price */}
      {/* {isOpenOrdersTab && ordersTableFeatures.DISPLAY_EST_EXECUTION_PRICE && ( */}
      {isOpenOrdersTab && (
        <styledEl.PriceElement onClick={toggleIsInverted}>
          {/*// TODO: gray out the price when it was updated too long ago*/}
          {spotPrice ? (
            <TokenAmount amount={spotPriceInverted} tokenSymbol={spotPriceInverted?.quoteCurrency} opacitySymbol />
          ) : spotPrice === null ? (
            '-'
          ) : (
            <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
          )}
        </styledEl.PriceElement>
      )}

      {/* Execution price */}
      {!isOpenOrdersTab && (
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
      )}

      {/* Executes at */}
      {isOpenOrdersTab && (
        <styledEl.PriceElement hasBackground onClick={toggleIsInverted}>
          {/*// TODO: gray out the price when it was updated too long ago*/}
          {prices ? (
            <styledEl.ExecuteCellWrapper>
              <EstimatedExecutionPrice
                amount={executionPriceInverted}
                tokenSymbol={executionPriceInverted?.quoteCurrency}
                opacitySymbol
                isInverted={isInverted}
                percentageDifference={priceDiffs?.percentage}
                amountDifference={priceDiffs?.amount}
                percentageFee={feeDifference}
                amountFee={feeAmount}
                canShowWarning={order.class !== OrderClass.MARKET && !isUnfillable}
                isUnfillable={isUnfillable}
              />
            </styledEl.ExecuteCellWrapper>
          ) : prices === null || isOrderCreating ? (
            '-'
          ) : (
            <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
          )}
        </styledEl.PriceElement>
      )}

      {/* Expires */}
      {/* Created */}
      {isOpenOrdersTab && (
        <styledEl.CellElement doubleRow>
          <b>{expirationTimeAgo}</b>
          <i>{creationTimeAgo}</i>
        </styledEl.CellElement>
      )}

      {/* TODO: Enable once there is back-end support */}
      {/* {!isOpenOrdersTab && ordersTableFeatures.DISPLAY_EXECUTION_TIME && (
        <styledEl.CellElement>
          <b>{order.status === OrderStatus.FULFILLED ? executedTimeAgo : '-'}</b>
        </styledEl.CellElement>
      )} */}

      {/* Filled % */}
      <styledEl.CellElement doubleRow clickable onClick={onClick}>
        <b>{filledPercentDisplay}%</b>
        <styledEl.ProgressBar value={filledPercentDisplay}></styledEl.ProgressBar>
      </styledEl.CellElement>

      {/* Status label */}
      <styledEl.CellElement>
        <styledEl.StatusBox>
          <OrderStatusBox order={order} withWarning={withWarning} onClick={onClick} />
          {withWarning && (
            <styledEl.WarningIndicator>
              <MouseoverTooltipContent
                wrap={false}
                bgColor={theme.alert}
                content={
                  <styledEl.WarningContent>
                    {!hasEnoughBalance && BalanceWarning(order.inputToken.symbol || '')}
                    {!hasEnoughAllowance && AllowanceWarning(order.inputToken.symbol || '')}
                  </styledEl.WarningContent>
                }
                placement="bottom"
              >
                <SVG src={AlertTriangle} description="Alert" width="14" height="13" />
              </MouseoverTooltipContent>
            </styledEl.WarningIndicator>
          )}
        </styledEl.StatusBox>
      </styledEl.CellElement>

      {/* Action content menu */}
      <styledEl.CellElement>
        <OrderContextMenu
          activityUrl={activityUrl}
          openReceipt={onClick}
          showCancellationModal={showCancellationModal}
        />
      </styledEl.CellElement>
    </TableRow>
  )
}

/**
 * Helper hook to prepare the parameters to calculate price difference
 */
function usePricesDifference(
  prices: OrderRowProps['prices'],
  spotPrice: OrderRowProps['spotPrice'],
  isInverted: boolean
): PriceDifference {
  const { estimatedExecutionPrice } = prices || {}

  return useSafeMemo(() => {
    return calculatePriceDifference({ referencePrice: spotPrice, targetPrice: estimatedExecutionPrice, isInverted })
  }, [estimatedExecutionPrice, spotPrice, isInverted])
}

/**
 * Helper hook to calculate fee amount percentage
 */
function useFeeAmountDifference(
  { inputCurrencyAmount }: OrderRowProps['orderParams']['rateInfoParams'],
  prices: OrderRowProps['prices']
): Percent | undefined {
  const { feeAmount } = prices || {}

  return useSafeMemo(
    () => calculatePercentageInRelationToReference({ value: feeAmount, reference: inputCurrencyAmount }),
    [feeAmount, inputCurrencyAmount]
  )
}
