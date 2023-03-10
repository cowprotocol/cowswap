import { useContext, useEffect, useState } from 'react'
import { DefaultTheme, StyledComponent, ThemeContext } from 'styled-components/macro'
import { OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { OrderParams } from '../utils/getOrderParams'
import { getSellAmountWithFee } from '@cow/modules/limitOrders/utils/getSellAmountWithFee'
import AlertTriangle from 'assets/cow-swap/alert.svg'
import SVG from 'react-inlinesvg'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import CurrencyLogo from 'components/CurrencyLogo'
import useTimeAgo from 'hooks/useTimeAgo'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { OrderStatusBox } from '@cow/modules/limitOrders/pure/OrderStatusBox'
import * as styledEl from './styled'
import { getEtherscanLink } from 'utils'
import { PendingOrderPrices } from '@cow/modules/orders/state/pendingOrdersPricesAtom'
import Loader from '@src/components/Loader'
import { OrderContextMenu } from '@cow/modules/limitOrders/pure/Orders/OrderRow/OrderContextMenu'
import { useSafeMemo } from '@cow/common/hooks/useSafeMemo'
import { getQuoteCurrency } from '@cow/common/services/getQuoteCurrency'
import { getAddress } from '@cow/utils/getAddress'
import { calculatePriceDifference, PriceDifference } from '@cow/modules/limitOrders/utils/calculatePriceDifference'
import { calculateFractionLikePercentDifference } from '@cow/modules/limitOrders/utils/calculateFractionLikePercentDifference'
import { EstimatedExecutionPrice } from '@cow/modules/limitOrders/pure/Orders/OrderRow/EstimatedExecutionPrice'

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
      balance to execute this limit order.
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
    <h3>Insufficient approval for this limit order</h3>
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
  RowElement: StyledComponent<'div', DefaultTheme, { isOpenOrdersTab?: boolean; hasBackground?: boolean }>
  isRateInverted: boolean
  isOpenOrdersTab: boolean
  orderParams: OrderParams
  onClick: () => void
  getShowCancellationModal(order: ParsedOrder): (() => void) | null
}

export function OrderRow({
  order,
  RowElement,
  isRateInverted,
  isOpenOrdersTab,
  getShowCancellationModal,
  orderParams,
  onClick,
  prices,
  spotPrice,
}: OrderRowProps) {
  const { buyAmount, rateInfoParams, hasEnoughAllowance, hasEnoughBalance, chainId } = orderParams
  const { parsedCreationTime, expirationTime, activityId, formattedPercentage, executedPrice } = order
  const { inputCurrencyAmount, outputCurrencyAmount } = rateInfoParams
  const { estimatedExecutionPrice, feeAmount } = prices || {}

  const showCancellationModal = getShowCancellationModal(order)

  const withWarning = !hasEnoughBalance || !hasEnoughAllowance
  const theme = useContext(ThemeContext)

  const expirationTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const creationTimeAgo = useTimeAgo(parsedCreationTime, TIME_AGO_UPDATE_INTERVAL)
  // TODO: set the real value when API returns it
  // const executedTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const activityUrl = chainId && activityId ? getEtherscanLink(chainId, activityId, 'transaction') : undefined

  const [isInverted, setIsInverted] = useState(isRateInverted)

  // Update internal isInverted flag whenever prop change
  useEffect(() => {
    setIsInverted(isRateInverted)
  }, [isRateInverted])

  // On mount, apply smart quote selection
  useEffect(() => {
    const quoteCurrency = getQuoteCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
    setIsInverted(getAddress(quoteCurrency) !== getAddress(inputCurrencyAmount?.currency))
    // Intentionally empty, should run only once
    // eslint-disable-next-line
  }, [])

  const executionPriceInverted = isInverted ? estimatedExecutionPrice?.invert() : estimatedExecutionPrice
  const executedPriceInverted = isInverted ? executedPrice?.invert() : executedPrice
  const spotPriceInverted = isInverted ? spotPrice?.invert() : spotPrice

  const priceDiffs = usePricesDifference(prices, spotPrice, isInverted)
  const feeDifference = useFeeAmountDifference(rateInfoParams, prices)

  return (
    <RowElement isOpenOrdersTab={isOpenOrdersTab}>
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
            noLabel={true}
            doNotUseSmartQuote
            isInverted={isInverted}
            rateInfoParams={rateInfoParams}
            opacitySymbol={true}
          />
        </styledEl.RateValue>
      </styledEl.CellElement>

      {/* Market price */}
      {/* {isOpenOrdersTab && limitOrdersFeatures.DISPLAY_EST_EXECUTION_PRICE && ( */}
      {isOpenOrdersTab && (
        <styledEl.CellElement>
          {/*// TODO: gray out the price when it was updated too long ago*/}
          {spotPrice ? (
            <TokenAmount amount={spotPriceInverted} tokenSymbol={spotPriceInverted?.quoteCurrency} opacitySymbol />
          ) : spotPrice === null ? (
            '-'
          ) : (
            <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
          )}
        </styledEl.CellElement>
      )}

      {/* Execution price */}
      {!isOpenOrdersTab && (
        <styledEl.CellElement>
          {executedPriceInverted ? (
            <TokenAmount
              amount={executedPriceInverted}
              tokenSymbol={executedPriceInverted?.quoteCurrency}
              opacitySymbol
            />
          ) : (
            '-'
          )}
        </styledEl.CellElement>
      )}

      {/* Executes at */}
      {isOpenOrdersTab && (
        <styledEl.CellElement hasBackground>
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
              />
            </styledEl.ExecuteCellWrapper>
          ) : prices === null ? (
            '-'
          ) : (
            <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
          )}
        </styledEl.CellElement>
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
      {/* {!isOpenOrdersTab && limitOrdersFeatures.DISPLAY_EXECUTION_TIME && (
        <styledEl.CellElement>
          <b>{order.status === OrderStatus.FULFILLED ? executedTimeAgo : '-'}</b>
        </styledEl.CellElement>
      )} */}

      {/* Filled % */}
      <styledEl.CellElement doubleRow>
        <b>{formattedPercentage}%</b>
        <styledEl.ProgressBar value={formattedPercentage}></styledEl.ProgressBar>
      </styledEl.CellElement>

      {/* Status label */}
      <styledEl.CellElement>
        <styledEl.StatusBox>
          <OrderStatusBox cancelling={!!order.isCancelling} status={order.status} withWarning={withWarning}>
            {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
          </OrderStatusBox>
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

      {/* Action contet menu */}
      <styledEl.CellElement>
        <OrderContextMenu
          activityUrl={activityUrl}
          openReceipt={onClick}
          showCancellationModal={showCancellationModal}
        />
      </styledEl.CellElement>
    </RowElement>
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
    return calculatePriceDifference({ reference: estimatedExecutionPrice, delta: spotPrice, isInverted })
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
    () => calculateFractionLikePercentDifference({ reference: feeAmount, delta: inputCurrencyAmount }),
    [feeAmount, inputCurrencyAmount]
  )
}
