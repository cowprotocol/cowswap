import { ReactNode } from 'react'

import orderPresignaturePendingIcon from '@cowprotocol/assets/cow-swap/order-presignature-pending.svg'
import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { Command, UiOrderType } from '@cowprotocol/types'
import { HoverTooltip, TokenAmount, percentIsAlmostHundred } from '@cowprotocol/ui'
import { Currency, Price } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'
import { Check, Clock, X, Zap } from 'react-feather'
import SVG from 'react-inlinesvg'
import { Nullish } from 'types'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { PendingOrderPrices } from 'modules/orders'

import { PENDING_EXECUTION_THRESHOLD_PERCENTAGE } from 'common/constants/common'
import type { RateInfoParams } from 'common/pure/RateInfo'
import { PriceDifference } from 'utils/orderUtils/calculatePriceDifference'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from '../../containers/OrderRow/OrderRow.styled'
import { useFeeAmountDifference } from '../../hooks/useFeeAmountDifference'
import { TwapOrderStatus } from '../TwapOrderStatus/TwapOrderStatus.pure'
import { OrderEstimatedExecutionPrice } from '../OrderEstimatedExecutionPrice/OrderEstimatedExecutionPrice.pure'

export interface OrderFillsAtProps {
  order: ParsedOrder
  isSafeWallet: boolean
  isTwapTable?: boolean
  isChild?: boolean
  isUnfillable: boolean
  isInverted: boolean
  withWarning: boolean
  estimatedPriceWarning: ReactNode | undefined
  childOrders?: ParsedOrder[]
  estimatedExecutionPrice: Nullish<Price<Currency, Currency>>
  priceDiffs: PriceDifference
  rateInfoParams: RateInfoParams
  prices: PendingOrderPrices | undefined | null
  spotPrice: Nullish<Price<Currency, Currency>>
  warningText: string
  onApprove?: Command
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function OrderFillsAt({
  order,
  isInverted,
  isSafeWallet,
  isTwapTable,
  isChild,
  isUnfillable,
  estimatedPriceWarning,
  childOrders,
  estimatedExecutionPrice,
  priceDiffs,
  rateInfoParams,
  prices,
  spotPrice,
  warningText,
  withWarning,
  onApprove,
}: OrderFillsAtProps) {
  const { filledPercentDisplay } = order.executionData
  const { t } = useLingui()
  const executionPriceInverted = isInverted ? estimatedExecutionPrice?.invert() : estimatedExecutionPrice
  const spotPriceInverted = isInverted ? spotPrice?.invert() : spotPrice
  const { feeAmount } = prices || {}

  const feeDifference = useFeeAmountDifference(rateInfoParams, prices)
  const walletType = isSafeWallet ? `Safe` : t`Smart contract`

  // Check for signing state first, regardless of order type
  if (order.status === OrderStatus.PRESIGNATURE_PENDING) {
    return (
      <styledEl.ExecuteCellWrapper>
        <HoverTooltip
          wrapInContainer={true}
          content={
            <div>
              <Trans>This order needs to be signed and executed with your {walletType} wallet</Trans>
            </div>
          }
        >
          <styledEl.SigningDisplay>
            <SVG src={orderPresignaturePendingIcon} description={t`signing`} />
            <Trans>Please sign order</Trans>
          </styledEl.SigningDisplay>
        </HoverTooltip>
      </styledEl.ExecuteCellWrapper>
    )
  }

  // For TWAP parent orders
  if (isTwapTable && !isChild && childOrders) {
    return (
      estimatedPriceWarning || (
        <styledEl.CellElement doubleRow>
          <TwapOrderStatus orderStatus={order.status} childOrders={childOrders}>
            -
          </TwapOrderStatus>
        </styledEl.CellElement>
      )
    )
  }

  // Regular order status handling
  if (getIsFinalizedOrder(order)) {
    // Check filled status first
    if (Number(filledPercentDisplay) > 0) {
      const value = Number(filledPercentDisplay) < 100 ? t`partially` : ''

      return (
        <styledEl.FilledDisplay>
          <Check size={14} strokeWidth={3.5} />
          <Trans>Order {value} filled</Trans>
        </styledEl.FilledDisplay>
      )
    }

    // Then check cancelled status
    if (order.status === OrderStatus.CANCELLED) {
      return (
        <styledEl.CancelledDisplay>
          <X size={14} strokeWidth={2.5} />
          <Trans>Order cancelled</Trans>
        </styledEl.CancelledDisplay>
      )
    }

    if (order.status === OrderStatus.EXPIRED) {
      return (
        <styledEl.ExpiredDisplay>
          <Clock size={14} strokeWidth={2.5} />
          <Trans>Order expired</Trans>
        </styledEl.ExpiredDisplay>
      )
    }

    if (isUnfillable) {
      return ''
    }

    return '-'
  }

  if (estimatedExecutionPrice && !estimatedExecutionPrice.equalTo(ZERO_FRACTION)) {
    const priceDiff = priceDiffs?.percentage.toFixed(2)
    const filledValue = !percentIsAlmostHundred(filledPercentDisplay) ? t`partially` : ''

    return (
      <styledEl.ExecuteCellWrapper>
        {!isUnfillable &&
        priceDiffs?.percentage &&
        Math.abs(Number(priceDiffs.percentage.toFixed(4))) <= PENDING_EXECUTION_THRESHOLD_PERCENTAGE ? (
          <HoverTooltip
            wrapInContainer={true}
            content={
              <div>
                <Trans>
                  The fill price of this order is close or at the market price (
                  <b>
                    fills at{' '}
                    <TokenAmount amount={executionPriceInverted} tokenSymbol={executionPriceInverted?.quoteCurrency} />
                  </b>
                  , {priceDiff}% from market) and is expected to {filledValue} fill soon.
                </Trans>
                <styledEl.ExecuteInformationTooltipWarning>
                  <Trans>
                    This price is taken from external sources and may not accurately reflect the current on-chain price.
                  </Trans>
                </styledEl.ExecuteInformationTooltipWarning>
              </div>
            }
          >
            <styledEl.PendingExecutionDisplay>
              <Zap size={14} strokeWidth={2.5} />
              <Trans>Pending execution</Trans>
            </styledEl.PendingExecutionDisplay>
          </HoverTooltip>
        ) : (
          <OrderEstimatedExecutionPrice
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
            onApprove={onApprove}
          />
        )}
      </styledEl.ExecuteCellWrapper>
    )
  }

  return '-'
}
