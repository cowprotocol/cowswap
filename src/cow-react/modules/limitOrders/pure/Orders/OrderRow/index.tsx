import { useContext, useEffect, useState } from 'react'
import styled, { DefaultTheme, StyledComponent, ThemeContext } from 'styled-components/macro'
import { OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { OrderParams } from '../utils/getOrderParams'
import { getSellAmountWithFee } from '@cow/modules/limitOrders/utils/getSellAmountWithFee'
import AlertTriangle from 'assets/cow-swap/alert.svg'
import SVG from 'react-inlinesvg'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'
import { TokenAmount, TokenAmountProps } from '@cow/common/pure/TokenAmount'
import CurrencyLogo from 'components/CurrencyLogo'
import useTimeAgo from 'hooks/useTimeAgo'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { OrderStatusBox } from '@cow/modules/limitOrders/pure/OrderStatusBox'
import * as styledEl from './styled'
import { getEtherscanLink } from 'utils'
import { PendingOrderPrices } from '@cow/modules/orders/state/pendingOrdersPricesAtom'
import Loader from '@src/components/Loader'
import { OrderContextMenu } from '@cow/modules/limitOrders/pure/Orders/OrderRow/OrderContextMenu'
import {
  calculateOrderExecutionStatus,
  OrderExecutionStatus,
} from '@cow/modules/limitOrders/utils/calculateOrderExecutionStatus'
import { useSafeMemo } from '@cow/common/hooks/useSafeMemo'
import { buildPriceFromCurrencyAmounts } from '@cow/modules/limitOrders/utils/buildPriceFromCurrencyAmounts'
import { darken } from 'polished'
import { getQuoteCurrency } from '@cow/common/services/getQuoteCurrency'
import { getAddress } from '@cow/utils/getAddress'

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

export function LowVolumeWarningContent() {
  const theme = useContext(ThemeContext)

  return (
    <styledEl.WarningIndicator hasBackground={false}>
      <MouseoverTooltipContent
        wrap={true}
        bgColor={theme.alert}
        content={
          <styledEl.WarningContent>
            <h3>Order unlikely to execute</h3>
            For this order, network fees would be <b>52.11%</b>{' '}
            <b>
              <i>(12.34 USDC)</i>
            </b>{' '}
            of your sell amount! Therefore, your order is unlikely to execute.
          </styledEl.WarningContent>
        }
        placement="bottom"
      >
        <SVG src={AlertTriangle} description="Alert" width="14" height="13" />
      </MouseoverTooltipContent>
    </styledEl.WarningIndicator>
  )
}

// TODO: temporary component, name and location. If keeping it, move it to its own module, rename, etc, etc
export const LowVolumeWarningTokenWrapper = styled.span<{ lowVolumeWarning: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ lowVolumeWarning, theme }) =>
    lowVolumeWarning ? darken(theme.darkMode ? 0 : 0.15, theme.alert) : 'inherit'};

  // Popover container override
  > div > div {
    display: flex;
    align-items: center;
  }
`

export function LowVolumeWarningToken(
  props: TokenAmountProps & { executeIndicator: React.ReactNode; lowVolumeWarning: boolean }
) {
  const { lowVolumeWarning, ...rest } = props

  return (
    <LowVolumeWarningTokenWrapper lowVolumeWarning={lowVolumeWarning}>
      <MouseoverTooltipContent
        wrap={true}
        content={
          <styledEl.ExecuteInformationTooltip>
            {/* TODO: Add logic to get the down/up + icon and the values below */}
            Market price needs to go down/up 📉📈 by
            <b>17.70 USDC</b>&nbsp;
            <b>
              <i>(~1.15%)</i>
            </b>
            &nbsp;to execute your order.
          </styledEl.ExecuteInformationTooltip>
        }
        placement="top"
      >
        {props.executeIndicator}
        <TokenAmount {...rest} />
      </MouseoverTooltipContent>

      {lowVolumeWarning && <LowVolumeWarningContent />}
    </LowVolumeWarningTokenWrapper>
  )
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
  const { estimatedExecutionPrice } = prices || {}

  const showCancellationModal = getShowCancellationModal(order)

  const withWarning = !hasEnoughBalance || !hasEnoughAllowance
  const theme = useContext(ThemeContext)

  const expirationTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const creationTimeAgo = useTimeAgo(parsedCreationTime, TIME_AGO_UPDATE_INTERVAL)
  // TODO: set the real value when API returns it
  // const executedTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const activityUrl = chainId && activityId ? getEtherscanLink(chainId, activityId, 'transaction') : undefined

  const [isInverted, setIsinverted] = useState(isRateInverted)

  // Update internal isInverted flag whenever prop change
  useEffect(() => {
    setIsinverted(isRateInverted)
  }, [isRateInverted])

  // On mount, apply smart quote selection
  useEffect(() => {
    const quoteCurrency = getQuoteCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
    setIsinverted(getAddress(quoteCurrency) !== getAddress(inputCurrencyAmount?.currency))
    // Intentionally empty, should run only once
  }, [])

  const executionPriceInverted = isInverted ? estimatedExecutionPrice?.invert() : estimatedExecutionPrice
  const executedPriceInverted = isInverted ? executedPrice?.invert() : executedPrice
  const spotPriceInverted = isInverted ? spotPrice?.invert() : spotPrice

  const executionOrderStatus = useOrderExecutionStatus(rateInfoParams, prices, spotPrice)

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
            setSmartQuoteSelectionOnce={false}
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
              <LowVolumeWarningToken
                // TODO: Add condition to show the lowVolumeWarning.
                executeIndicator={<styledEl.ExecuteIndicator status={executionOrderStatus} />}
                lowVolumeWarning={true}
                amount={executionPriceInverted}
                tokenSymbol={executionPriceInverted?.quoteCurrency}
                opacitySymbol
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

function useOrderExecutionStatus(
  rateInfo: OrderRowProps['orderParams']['rateInfoParams'],
  prices: OrderRowProps['prices'],
  spotPrice: OrderRowProps['spotPrice']
): OrderExecutionStatus | undefined {
  return useSafeMemo(() => {
    const limitPrice = buildPriceFromCurrencyAmounts(rateInfo.inputCurrencyAmount, rateInfo.outputCurrencyAmount)
    const { estimatedExecutionPrice } = prices || {}

    return calculateOrderExecutionStatus({ limitPrice, spotPrice, estimatedExecutionPrice })
  }, [rateInfo.inputCurrencyAmount, rateInfo.outputCurrencyAmount, prices?.estimatedExecutionPrice, spotPrice])
}
