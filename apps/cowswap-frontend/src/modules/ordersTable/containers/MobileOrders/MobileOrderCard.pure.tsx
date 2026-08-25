import { ReactNode } from 'react'

import { buildPriceFromCurrencyAmounts, formatDateWithTimezone, formatTokenAmount } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@cowprotocol/currency'
import { PercentDisplay, TokenAmount, UI } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { useTwapOrderById } from 'entities/twap'
import { AlertTriangle, ChevronRight } from 'react-feather'

import { OrderStatus } from 'legacy/state/orders/actions'

import { CurrencyLogoPair } from 'common/pure/CurrencyLogoPair'
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './MobileOrders.styled'

import { WarningReason } from '../../pure/OrderEstimatedExecutionPrice/orderEstimatedExecutionPrice.constants'
import { getOrderStatusTitleAndColor } from '../../pure/OrderStatusBox/getOrderStatusTitleAndColor'
import { OrderTableItem } from '../../state/ordersTable.types'
import { OrdersDateGroup } from '../../utils/groupOrdersByDate.utils'
import { getParsedOrderFromTableItem, isParsedOrder } from '../../utils/orderTableGroupUtils'

export interface MobileOrderCardProps {
  item: OrderTableItem
  dateGroup?: OrdersDateGroup
  warningReason?: WarningReason
  onOpen(): void
}

interface CardAmountsProps {
  order: ParsedOrder
}

interface CardFooterProps {
  dateGroup?: OrdersDateGroup
  order: ParsedOrder
  partCount: number
  warningReason?: WarningReason
}

interface LifecycleEvent {
  type: 'created' | 'filled' | 'expired'
  date: Date
}

interface OrderSummaryProps {
  isExecutionDataTrusted: boolean
  order: ParsedOrder
  warningReason?: WarningReason
}

interface OrderSummaryState {
  executedPrice: ParsedOrder['executionData']['executedPrice']
  fillPercentage: number
  isTerminalWithoutFill: boolean
  showExecutionPrice: boolean
  showFillProgress: boolean
  showLimitPrice: boolean
}

export function MobileOrderCard({ item, dateGroup, warningReason, onOpen }: MobileOrderCardProps): ReactNode {
  const { t } = useLingui()
  const order = getParsedOrderFromTableItem(item)
  const twapOrder = useTwapOrderById(order.id)
  const inputSymbol = order.inputToken.symbol ?? ''
  const outputSymbol = order.outputToken.symbol ?? ''
  const partCount = isParsedOrder(item) ? 0 : (twapOrder?.order.n ?? item.children.length)
  const isExecutionDataTrusted = isParsedOrder(item) && !order.isEoaTwapOrder

  return (
    <styledEl.Card
      type="button"
      data-id={order.id}
      aria-label={t`View order ${inputSymbol} to ${outputSymbol}`}
      onClick={onOpen}
    >
      <CardAmounts order={order} />
      <OrderSummary order={order} warningReason={warningReason} isExecutionDataTrusted={isExecutionDataTrusted} />
      <CardFooter order={order} dateGroup={dateGroup} partCount={partCount} warningReason={warningReason} />
    </styledEl.Card>
  )
}

function CardAmounts({ order }: CardAmountsProps): ReactNode {
  const { t } = useLingui()
  const sellAmount = getSellAmountWithFee(order)
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount)

  return (
    <styledEl.CardHeader>
      <styledEl.Pair>
        <styledEl.Logos>
          <CurrencyLogoPair sellToken={order.inputToken} buyToken={order.outputToken} tokenSize={36} />
        </styledEl.Logos>

        <styledEl.Amounts>
          <styledEl.AmountRow>
            <styledEl.AmountLabel>{t`Sell`}</styledEl.AmountLabel>
            <styledEl.Amount>
              <TokenAmount amount={sellAmount} tokenSymbol={sellAmount.currency} />
            </styledEl.Amount>
          </styledEl.AmountRow>
          <styledEl.AmountRow>
            <styledEl.AmountLabel>{t`Buy`}</styledEl.AmountLabel>
            <styledEl.Amount>
              <TokenAmount amount={buyAmount} tokenSymbol={buyAmount.currency} />
            </styledEl.Amount>
          </styledEl.AmountRow>
        </styledEl.Amounts>
      </styledEl.Pair>

      <styledEl.Arrow aria-hidden>
        <ChevronRight size={24} strokeWidth={2} />
      </styledEl.Arrow>
    </styledEl.CardHeader>
  )
}

function CardFooter({ dateGroup, order, partCount, warningReason }: CardFooterProps): ReactNode {
  const { i18n, t } = useLingui()
  const lifecycleEvent = getLifecycleEvent(order)
  const eventAt = formatEventAt(lifecycleEvent.date, order.creationTime, dateGroup, i18n.locale)
  const createdAt = eventAt
  const defaultStatus = getOrderStatusTitleAndColor(order)
  const status = warningReason
    ? {
        title: t`Action required`,
        color: `var(${UI.COLOR_DANGER_TEXT})`,
        background: `var(${UI.COLOR_DANGER_BG})`,
      }
    : defaultStatus

  return (
    <styledEl.CardFooter>
      <styledEl.CreatedAt title={formatDateWithTimezone(lifecycleEvent.date)}>
        <span>
          {lifecycleEvent.type === 'filled'
            ? t`Filled ${eventAt}`
            : lifecycleEvent.type === 'expired'
              ? t`Expired ${eventAt}`
              : t`Created ${createdAt}`}
        </span>
        {partCount === 1 ? (
          <span>{t`TWAP · 1 part`}</span>
        ) : partCount > 1 ? (
          <span>{t`TWAP · ${partCount} parts`}</span>
        ) : null}
      </styledEl.CreatedAt>
      <styledEl.StatusBadge $color={status.color} $background={status.background}>
        {warningReason ? <AlertTriangle aria-hidden size={13} /> : null}
        {status.title}
      </styledEl.StatusBadge>
    </styledEl.CardFooter>
  )
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function formatEventAt(date: Date, creationTime: Date, dateGroup: OrdersDateGroup | undefined, locale: string): string {
  const sameDayGroup =
    (dateGroup === OrdersDateGroup.TODAY || dateGroup === OrdersDateGroup.YESTERDAY) &&
    isSameCalendarDate(date, creationTime)
  const options: Intl.DateTimeFormatOptions = sameDayGroup
    ? { hour: '2-digit', minute: '2-digit' }
    : {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }

  return new Intl.DateTimeFormat(locale, options).format(date)
}

function getLifecycleEvent(order: ParsedOrder): LifecycleEvent {
  const isFullyFilled = order.status === OrderStatus.FULFILLED || order.executionData.fullyFilled

  if (isFullyFilled && order.fulfillmentTime) {
    const fulfillmentTime = new Date(order.fulfillmentTime)

    if (isValidDate(fulfillmentTime)) return { type: 'filled', date: fulfillmentTime }
  }

  if (order.status === OrderStatus.EXPIRED && isValidDate(order.expirationTime)) {
    return { type: 'expired', date: order.expirationTime }
  }

  return { type: 'created', date: order.creationTime }
}

function getOrderSummaryState(
  order: ParsedOrder,
  warningReason: WarningReason | undefined,
  isExecutionDataTrusted: boolean,
): OrderSummaryState {
  if (!isExecutionDataTrusted) {
    return {
      executedPrice: null,
      fillPercentage: 0,
      isTerminalWithoutFill: false,
      showExecutionPrice: false,
      showFillProgress: false,
      showLimitPrice: true,
    }
  }

  const fillPercentage = clampPercentage(Number(order.executionData.filledPercentDisplay))
  const isFullyFilled = order.status === OrderStatus.FULFILLED || order.executionData.fullyFilled
  const isPartiallyFilled = !isFullyFilled && fillPercentage > 0
  const isTerminalWithoutFill =
    fillPercentage === 0 &&
    (order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.EXPIRED ||
      order.status === OrderStatus.FAILED)
  const executedPrice = order.executionData.executedPrice

  return {
    executedPrice,
    fillPercentage,
    isTerminalWithoutFill,
    showExecutionPrice: !warningReason && !!executedPrice && (isFullyFilled || isPartiallyFilled),
    showFillProgress: isPartiallyFilled || (isFullyFilled && !executedPrice),
    showLimitPrice: warningReason
      ? !isPartiallyFilled
      : isTerminalWithoutFill || (!isFullyFilled && !isPartiallyFilled) || !executedPrice,
  }
}

function isSameCalendarDate(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function isValidDate(date: Date): boolean {
  return Number.isFinite(date.getTime())
}

function OrderSummary({ isExecutionDataTrusted, order, warningReason }: OrderSummaryProps): ReactNode {
  const { t } = useLingui()
  const inputSymbol = order.inputToken.symbol ?? ''
  const outputSymbol = order.outputToken.symbol ?? ''
  const limitSellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount)
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount)
  const limitPrice = buildPriceFromCurrencyAmounts(limitSellAmount, buyAmount)
  const { executedPrice, fillPercentage, isTerminalWithoutFill, showExecutionPrice, showFillProgress, showLimitPrice } =
    getOrderSummaryState(order, warningReason, isExecutionDataTrusted)
  const warningLabel =
    warningReason === WarningReason.FallbackHandler
      ? t`Update fallback handler`
      : warningReason === WarningReason.Balance
        ? t`Insufficient balance`
        : warningReason === WarningReason.Allowance
          ? t`Insufficient allowance`
          : undefined

  return (
    <styledEl.Summary>
      {warningLabel ? (
        <styledEl.SummaryRow>
          <styledEl.SummaryLabel>{t`Action required`}</styledEl.SummaryLabel>
          <styledEl.WarningValue>{warningLabel}</styledEl.WarningValue>
        </styledEl.SummaryRow>
      ) : null}

      {isTerminalWithoutFill ? (
        <styledEl.SummaryRow>
          <styledEl.SummaryLabel>{t`Fill outcome`}</styledEl.SummaryLabel>
          <styledEl.OutcomeValue>{t`Not filled`}</styledEl.OutcomeValue>
        </styledEl.SummaryRow>
      ) : null}

      {showFillProgress ? (
        <styledEl.SummaryRow>
          <styledEl.SummaryLabel>{t`Fill outcome`}</styledEl.SummaryLabel>
          <styledEl.FillValue>
            <styledEl.ProgressTrack
              role="progressbar"
              aria-label={t`Filled`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={fillPercentage}
            >
              <styledEl.Progress $value={fillPercentage} />
            </styledEl.ProgressTrack>
            <PercentDisplay percent={order.executionData.filledPercentDisplay} />
          </styledEl.FillValue>
        </styledEl.SummaryRow>
      ) : null}

      {showExecutionPrice && executedPrice ? (
        <styledEl.SummaryRow>
          <styledEl.SummaryLabel>{t`Avg. execution price`}</styledEl.SummaryLabel>
          <styledEl.Price>{`1 ${inputSymbol} = ${formatTokenAmount(executedPrice)} ${outputSymbol}`}</styledEl.Price>
        </styledEl.SummaryRow>
      ) : null}

      {showLimitPrice ? (
        <styledEl.SummaryRow>
          <styledEl.SummaryLabel>{t`Limit price`}</styledEl.SummaryLabel>
          <styledEl.Price>{`1 ${inputSymbol} = ${formatTokenAmount(limitPrice)} ${outputSymbol}`}</styledEl.Price>
        </styledEl.SummaryRow>
      ) : null}
    </styledEl.Summary>
  )
}
