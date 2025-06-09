import React, { useEffect, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { Color } from '@cowprotocol/ui'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { safeTokenName } from '@gnosis.pm/dex-js'
import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import Spinner from 'components/common/Spinner'
import { TokenDisplay } from 'components/common/TokenDisplay'
import TradeOrderType from 'components/common/TradeOrderType'
import Icon from 'components/Icon'
import { HelpTooltip } from 'components/Tooltip'
import { TextWithTooltip } from 'explorer/components/common/TextWithTooltip'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { FormatAmountPrecision, formattedAmount } from 'utils'

import { Order, OrderStatus } from 'api/operator'
import { getLimitPrice } from 'utils/getLimitPrice'

import { OrderSurplusDisplayStyledByRow } from './OrderSurplusTooltipStyledByRow'
import { ToggleFilter } from './ToggleFilter'

import { TableState } from '../../../explorer/components/TokensTableWidget/useTable'
import { SimpleTable, SimpleTableProps } from '../../common/SimpleTable'
import { StatusLabel } from '../StatusLabel'
import { UnsignedOrderWarning } from '../UnsignedOrderWarning'

const EXPIRED_CANCELED_STATES: OrderStatus[] = [OrderStatus.Cancelled, OrderStatus.Cancelling, OrderStatus.Expired]

function isExpiredOrCanceled(order: Order): boolean {
  const { executedSellAmount, executedBuyAmount, status } = order
  // We don't consider an order expired or canceled if it was partially or fully filled
  if (!executedSellAmount.isZero() || !executedBuyAmount.isZero()) return false

  // Otherwise, return if the order is expired or canceled
  return EXPIRED_CANCELED_STATES.includes(status)
}

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-size: 1.5rem;
  padding: 3.2rem;
  min-height: 25rem;
`

export type Props = SimpleTableProps & {
  orders: Order[] | undefined
  tableState: TableState
  handleNextPage: Command
  messageWhenEmpty?: string | React.ReactNode
}

interface RowProps {
  order: Order
  isPriceInverted: boolean

  // TODO: Filter by state using the API. Not available for now, so filtering in the client
  showCanceledAndExpired: boolean
  showPreSigning: boolean
}

const FilterRow = styled.tr`
  background: ${Color.explorer_background};

  @media (max-width: 1155px) {
    div:first-child {
      max-width: 90vw;
    }
  }

  td {
    padding: 2rem;
    text-align: right;
    padding-right: 1rem;
    max-width: 100%;
    & > * {
      margin-left: 1rem;
    }
  }

  p {
    word-wrap: break-word;
    white-space: normal;
  }
`

const Filters = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 1rem;
`

const HiddenOrdersLegend = styled.div`
  p {
    text-align: center;
  }

  a {
    text-decoration: underline;
  }

  a:hover {
    color: ${Color.explorer_textSecondary1};
  }
`

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
const RowOrder: React.FC<RowProps> = ({ order, isPriceInverted, showCanceledAndExpired, showPreSigning }) => {
  const { creationDate, buyToken, buyAmount, sellToken, sellAmount, kind, partiallyFilled, uid, filledPercentage } =
    order
  const [_isPriceInverted, setIsPriceInverted] = useState(isPriceInverted)
  const network = useNetworkId()
  const buyTokenSymbol = buyToken ? safeTokenName(buyToken) : ''
  const sellTokenSymbol = sellToken ? safeTokenName(sellToken) : ''
  const sellFormattedAmount = formattedAmount(sellToken, sellAmount.plus(order.feeAmount))
  const buyFormattedAmount = formattedAmount(buyToken, buyAmount)
  const limitPriceSettled = getLimitPrice(order, _isPriceInverted)

  useEffect(() => {
    setIsPriceInverted(isPriceInverted)
  }, [isPriceInverted])

  const renderSpinnerWhenNoValue = (textValue: string): React.ReactNode | void => {
    if (textValue === '-') return <Spinner spin size="1x" />
  }

  // Hide the row if the order is canceled, expired or pre-signing
  if (!showCanceledAndExpired && isExpiredOrCanceled(order)) return null
  if (!showPreSigning && order.status === OrderStatus.Signing) return null

  return (
    <tr key={uid}>
      <td>
        <RowWithCopyButton
          className="span-copybtn-wrap"
          textToCopy={uid}
          contentsToDisplay={
            <LinkWithPrefixNetwork to={`/orders/${order.uid}`} rel="noopener noreferrer" target="_self">
              <TruncatedText>{uid}</TruncatedText>
            </LinkWithPrefixNetwork>
          }
        />
      </td>
      <td>
        <span className="header-value">
          <TradeOrderType kind={kind} />
        </span>
      </td>
      <td>
        {renderSpinnerWhenNoValue(sellFormattedAmount) || (
          <TextWithTooltip textInTooltip={`${sellFormattedAmount} ${sellTokenSymbol}`}>
            {formattedAmount(sellToken, sellAmount.plus(order.feeAmount), FormatAmountPrecision.highPrecision)}{' '}
            {sellToken && network && <TokenDisplay showAbbreviated erc20={sellToken} network={network} />}
          </TextWithTooltip>
        )}
      </td>
      <td>
        {renderSpinnerWhenNoValue(buyFormattedAmount) || (
          <TextWithTooltip textInTooltip={`${buyFormattedAmount} ${buyTokenSymbol}`}>
            {formattedAmount(buyToken, buyAmount, FormatAmountPrecision.highPrecision)}{' '}
            {buyToken && network && <TokenDisplay showAbbreviated erc20={buyToken} network={network} />}
          </TextWithTooltip>
        )}
      </td>
      <td>{renderSpinnerWhenNoValue(limitPriceSettled) || limitPriceSettled}</td>
      <td>
        <OrderSurplusDisplayStyledByRow order={order} />
      </td>
      <td>
        <DateDisplay date={creationDate} showIcon={true} />
      </td>
      <td>
        <StatusLabel status={order.status} partiallyFilled={partiallyFilled} filledPercentage={filledPercentage} />
      </td>
    </tr>
  )
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
const OrdersUserDetailsTable: React.FC<Props> = (props) => {
  const { orders, messageWhenEmpty, tableState, handleNextPage } = props
  const [isPriceInverted, setIsPriceInverted] = useState(false)
  const [showCanceledAndExpired, setShowCanceledAndExpired] = useState(false)
  const [showPreSigning, setShowPreSigning] = useState(false)

  const canceledAndExpiredCount = orders?.filter(isExpiredOrCanceled).length || 0
  const preSigningCount = orders?.filter((order) => order.status === OrderStatus.Signing).length || 0
  const showFilter = canceledAndExpiredCount > 0 || preSigningCount > 0

  const hiddenOrdersCount =
    (showPreSigning ? 0 : preSigningCount) + (showCanceledAndExpired ? 0 : canceledAndExpiredCount)

  const areOrdersAllHidden = orders?.length === hiddenOrdersCount

  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  if (!orders?.length) {
    return <Wrapper>{messageWhenEmpty || 'No orders.'}</Wrapper>
  }

  return (
    <SimpleTable
      header={
        <>
          {!areOrdersAllHidden && (
            <tr>
              <th>
                <span>
                  Order ID <HelpTooltip tooltip={tooltip.orderID} />
                </span>
              </th>
              <th>Type</th>
              <th>Sell amount</th>
              <th>Buy amount</th>
              <th>
                <span>
                  Limit price <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
                </span>
              </th>
              <th>Surplus</th>
              <th>Created</th>
              <th>Status</th>
            </tr>
          )}
          {showPreSigning && (
            <FilterRow>
              <td colSpan={8}>
                <div>
                  <UnsignedOrderWarning />
                </div>
              </td>
            </FilterRow>
          )}
        </>
      }
      body={
        <>
          {!areOrdersAllHidden &&
            orders.map((item) => (
              <RowOrder
                key={item.uid}
                order={item}
                isPriceInverted={isPriceInverted}
                showCanceledAndExpired={showCanceledAndExpired}
                showPreSigning={showPreSigning}
              />
            ))}

          {showFilter && (
            <FilterRow>
              <td colSpan={8}>
                <div>
                  <HiddenOrdersLegend>
                    {hiddenOrdersCount > 0 ? (
                      <>
                        <p>
                          Showing {orders.length - hiddenOrdersCount} out of {orders.length} orders for the current
                          page.
                        </p>
                        <p>
                          {hiddenOrdersCount} orders are hidden, you can make them visible using the filters below
                          {tableState.hasNextPage ? (
                            <span>
                              , or go to&nbsp;<a onClick={handleNextPage}>next page</a>&nbsp;for more orders.
                            </span>
                          ) : (
                            '.'
                          )}
                        </p>
                      </>
                    ) : (
                      <p>Showing all {orders.length} orders for the current page.</p>
                    )}
                  </HiddenOrdersLegend>
                  <Filters>
                    {canceledAndExpiredCount > 0 && (
                      <ToggleFilter
                        checked={showCanceledAndExpired}
                        onChange={() => setShowCanceledAndExpired((previousValue) => !previousValue)}
                        label={(showCanceledAndExpired ? 'Hide' : 'Show') + ' canceled/expired'}
                        count={canceledAndExpiredCount}
                      />
                    )}
                    {preSigningCount > 0 && (
                      <>
                        <ToggleFilter
                          checked={showPreSigning}
                          onChange={() => setShowPreSigning((previousValue) => !previousValue)}
                          label={(showPreSigning ? 'Hide' : 'Show') + ' unsigned'}
                          count={preSigningCount}
                        />
                      </>
                    )}
                  </Filters>
                </div>
              </td>
            </FilterRow>
          )}
        </>
      }
    />
  )
}

export default OrdersUserDetailsTable
