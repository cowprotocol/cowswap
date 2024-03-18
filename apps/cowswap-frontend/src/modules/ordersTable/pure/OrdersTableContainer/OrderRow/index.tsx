import React, { useCallback, useEffect, useMemo, useState } from 'react'

import AlertTriangle from '@cowprotocol/assets/cow-swap/alert.svg'
import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { getAddress, getEtherscanLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Command, UiOrderType } from '@cowprotocol/types'
import { ButtonSecondary, Loader, TokenAmount, TokenSymbol, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

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
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { EstimatedExecutionPrice } from './EstimatedExecutionPrice'
import { OrderContextMenu } from './OrderContextMenu'
import * as styledEl from './styled'

import { OrderParams } from '../../../utils/getOrderParams'
import { OrderStatusBox } from '../../OrderStatusBox'
import { CheckboxCheckmark, TableRow, TableRowCheckbox, TableRowCheckboxWrapper } from '../styled'
import { OrderActions } from '../types'

const TIME_AGO_UPDATE_INTERVAL = 3000

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

function BalanceWarning(params: { symbol: string; isScheduled: boolean }) {
  const { symbol, isScheduled } = params

  return (
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
        {isScheduled ? (
          <>
            If there are not enough funds for this order by creation time, this part won't be created. Top up your{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            balance before then to have it created.
          </>
        ) : (
          <>
            The order is still open and will become executable when you top up your{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            balance.
          </>
        )}
      </p>
    </styledEl.WarningParagraph>
  )
}
function AllowanceWarning(params: { symbol: string; isScheduled: boolean; approve: Command }) {
  const { symbol, isScheduled } = params

  return (
    <styledEl.WarningParagraph>
      <h3>Insufficient approval for this order</h3>
      <p>
        {isScheduled ? (
          <>
            You haven't given CoW Swap sufficient allowance to spend{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>
            .
            <br />
            If there's not enough allowance for this order by creation time, this part won't be created. Approve{' '}
            <strong>
              <TokenSymbol token={{ symbol }} />
            </strong>{' '}
            in your account token page before then to have it created.
          </>
        ) : (
          <>
            This order is still open and valid, but you haven't given CoW Swap sufficient allowance to spend{' '}
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
          </>
        )}
      </p>
      <styledEl.WarningActionBox>
        <ButtonSecondary onClick={params.approve}>Approve</ButtonSecondary>
      </styledEl.WarningActionBox>
    </styledEl.WarningParagraph>
  )
}

export interface OrderRowProps {
  order: ParsedOrder
  prices: PendingOrderPrices | undefined | null
  spotPrice: Price<Currency, Currency> | undefined | null
  isRateInverted: boolean
  isOpenOrdersTab: boolean
  isRowSelectable: boolean
  isRowSelected: boolean
  isChild?: boolean
  orderParams: OrderParams
  onClick: Command
  orderActions: OrderActions
  hasValidPendingPermit?: boolean | undefined
  children?: JSX.Element
}

export function OrderRow({
  order,
  isRateInverted: isGloballyInverted,
  isOpenOrdersTab,
  isRowSelectable,
  isRowSelected,
  isChild,
  orderActions,
  orderParams,
  onClick,
  prices,
  spotPrice,
  children,
  hasValidPendingPermit,
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
    [order, orderActions]
  )

  const withAllowanceWarning = hasEnoughAllowance === false && hasValidPendingPermit === false
  const withWarning =
    (hasEnoughBalance === false || withAllowanceWarning) &&
    // show the warning only for pending and scheduled orders
    (status === OrderStatus.PENDING || status === OrderStatus.SCHEDULED)
  const isOrderScheduled = order.status === OrderStatus.SCHEDULED

  const isScheduledCreating = isOrderScheduled && Date.now() > creationTime.getTime()
  const expirationTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const creationTimeAgo = useTimeAgo(creationTime, TIME_AGO_UPDATE_INTERVAL)

  // TODO: set the real value when API returns it
  // const executedTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
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

  const priceDiffs = usePricesDifference(prices, spotPrice, isInverted)
  const feeDifference = useFeeAmountDifference(rateInfoParams, prices)

  const isUnfillable =
    (executedPriceInverted !== undefined && executedPriceInverted?.equalTo(ZERO_FRACTION)) || withWarning
  const isOrderCreating = CREATING_STATES.includes(order.status)

  const inputTokenSymbol = order.inputToken.symbol || ''

  return (
    <TableRow
      data-id={order.id}
      isChildOrder={isChild}
      isOpenOrdersTab={isOpenOrdersTab}
      isRowSelectable={isRowSelectable}
    >
      {/*Checkbox for multiple cancellation*/}
      {isRowSelectable && isOpenOrdersTab && (
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
          {prices && estimatedExecutionPrice ? (
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
                canShowWarning={getUiOrderType(order) !== UiOrderType.SWAP && !isUnfillable}
                isUnfillable={isUnfillable}
              />
            </styledEl.ExecuteCellWrapper>
          ) : prices === null || !estimatedExecutionPrice || isOrderCreating ? (
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
          <i>{isScheduledCreating ? 'Creating...' : creationTimeAgo}</i>
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
          {children ? (
            children
          ) : (
            <>
              <OrderStatusBox order={order} withWarning={withWarning} onClick={onClick} />
              {withWarning && (
                <styledEl.WarningIndicator>
                  <styledEl.StyledQuestionHelper
                    placement="bottom"
                    bgColor={`var(${UI.COLOR_ALERT})`}
                    color={`var(${UI.COLOR_ALERT_TEXT_DARKER})`}
                    Icon={<SVG src={AlertTriangle} description="Alert" width="14" height="13" />}
                    text={
                      <styledEl.WarningContent>
                        {hasEnoughBalance === false && (
                          <BalanceWarning symbol={inputTokenSymbol} isScheduled={isOrderScheduled} />
                        )}
                        {withAllowanceWarning && (
                          <AllowanceWarning
                            approve={() => orderActions.approveOrderToken(order.inputToken)}
                            symbol={inputTokenSymbol}
                            isScheduled={isOrderScheduled}
                          />
                        )}
                      </styledEl.WarningContent>
                    }
                  />
                </styledEl.WarningIndicator>
              )}
            </>
          )}
        </styledEl.StatusBox>
      </styledEl.CellElement>

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
