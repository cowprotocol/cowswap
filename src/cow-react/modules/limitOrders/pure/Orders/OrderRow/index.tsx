import { useContext } from 'react'
import { DefaultTheme, StyledComponent, ThemeContext } from 'styled-components/macro'
import { OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { FileText, Link2, MoreHorizontal, Trash2 } from 'react-feather'
import { Menu } from '@reach/menu-button'
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
import { transparentize } from 'polished'
import { getEtherscanLink } from 'utils'
import { PendingOrderPrices } from '@cow/modules/orders/state/pendingOrdersPricesAtom'
import Loader from '@src/components/Loader'

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
    <h3>Insufficient balance for this limit order</h3>
    <p>
      Your wallet currently has insufficient{' '}
      <strong>
        <TokenSymbol token={{ symbol }} />
      </strong>{' '}
      balance to execute this order.
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
  prices: PendingOrderPrices | undefined
  RowElement: StyledComponent<'div', DefaultTheme>
  isRateInversed: boolean
  isOpenOrdersTab: boolean
  orderParams: OrderParams
  onClick: () => void
  getShowCancellationModal(order: ParsedOrder): (() => void) | null
}

export function OrderRow({
  order,
  RowElement,
  isRateInversed,
  isOpenOrdersTab,
  getShowCancellationModal,
  orderParams,
  onClick,
  prices,
}: OrderRowProps) {
  const { buyAmount, rateInfoParams, hasEnoughAllowance, hasEnoughBalance, chainId } = orderParams
  const { parsedCreationTime, expirationTime, id, formattedPercentage, executedPrice } = order

  const showCancellationModal = getShowCancellationModal(order)

  const withWarning = !hasEnoughBalance || !hasEnoughAllowance
  const theme = useContext(ThemeContext)

  const expirationTimeAgo = useTimeAgo(expirationTime, TIME_AGO_UPDATE_INTERVAL)
  const creationTimeAgo = useTimeAgo(parsedCreationTime, TIME_AGO_UPDATE_INTERVAL)
  const activityUrl = chainId ? getEtherscanLink(chainId, id, 'transaction') : undefined

  const executionPriceInversed = isRateInversed ? prices?.executionPrice.invert() : prices?.executionPrice
  const marketPriceInversed = isRateInversed ? prices?.marketPrice.invert() : prices?.marketPrice
  const executedPriceInversed = isRateInversed ? executedPrice?.invert() : executedPrice

  return (
    <RowElement>
      {/* Order sell/buy tokens */}
      <styledEl.CurrencyCell onClick={onClick}>
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
          <RateInfo prependSymbol={false} noLabel={true} isInversed={isRateInversed} rateInfoParams={rateInfoParams} />
        </styledEl.RateValue>
      </styledEl.CellElement>

      {/* Est. execution price */}
      {/* Market price */}
      {isOpenOrdersTab && (
        <styledEl.CellElement doubleRow>
          {/*// TODO: gray out the price when it was updated too long ago*/}
          {prices ? (
            <>
              <b>
                <TokenAmount amount={executionPriceInversed} tokenSymbol={executionPriceInversed?.quoteCurrency} />
              </b>
              <i>
                <TokenAmount amount={marketPriceInversed} tokenSymbol={marketPriceInversed?.quoteCurrency} />
              </i>
            </>
          ) : (
            <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />
          )}
        </styledEl.CellElement>
      )}
      {!isOpenOrdersTab && (
        <styledEl.CellElement>
          {executedPriceInversed ? (
            <TokenAmount amount={executedPriceInversed} tokenSymbol={executedPriceInversed?.quoteCurrency} />
          ) : (
            '-'
          )}
        </styledEl.CellElement>
      )}

      {/* Expires */}
      {/* Created */}
      <styledEl.CellElement doubleRow>
        <b>{expirationTimeAgo}</b>
        <i>{creationTimeAgo}</i>
      </styledEl.CellElement>

      {/* Filled % */}
      <styledEl.CellElement doubleRow>
        <b>{formattedPercentage}%</b>
        <styledEl.ProgressBar value={formattedPercentage}></styledEl.ProgressBar>
      </styledEl.CellElement>

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
      <styledEl.CellElement>
        <Menu>
          <styledEl.ContextMenuButton>
            <MoreHorizontal color={transparentize(0.5, theme.text1)} />
          </styledEl.ContextMenuButton>
          <styledEl.ContextMenuList>
            <styledEl.ContextMenuItem onSelect={onClick}>
              <FileText size={16} />
              <span>Order receipt</span>
            </styledEl.ContextMenuItem>
            <styledEl.ContextMenuLink as="a" href={activityUrl} target="_blank">
              <Link2 size={16} />
              <span>View on explorer</span>
            </styledEl.ContextMenuLink>
            {showCancellationModal && (
              <styledEl.ContextMenuItem $red onSelect={() => showCancellationModal()}>
                <Trash2 size={16} />
                <span>Cancel order</span>
              </styledEl.ContextMenuItem>
            )}
          </styledEl.ContextMenuList>
        </Menu>
      </styledEl.CellElement>
    </RowElement>
  )
}
