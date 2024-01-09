import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { safeTokenName } from '@gnosis.pm/dex-js'

import { Order } from 'api/operator'
import { useNetworkId } from 'state/network'

import { DateDisplay } from 'components/common/DateDisplay'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { getOrderLimitPrice, formatCalculatedPriceToDisplay, formattedAmount, FormatAmountPrecision } from 'utils'
import { StatusLabel } from '../StatusLabel'
import { HelpTooltip } from 'components/Tooltip'
import StyledUserDetailsTable, {
  Props as StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'
import Icon from 'components/Icon'
import TradeOrderType from 'components/common/TradeOrderType'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'
import Spinner from 'components/common/Spinner'
import { OrderSurplusDisplayStyledByRow } from './OrderSurplusTooltipStyledByRow'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 11rem 5.5rem repeat(2, minmax(16rem, 1.5fr)) minmax(18rem, 2fr) 10rem minmax(21.6rem, 2fr) 1.36fr;
  }
  tr > td {
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      img {
        padding: 0;
      }
    }
  }
  ${media.mediumDown} {
    > thead > tr {
      display: none;
    }
    > tbody > tr {
      grid-template-columns: none;
      border: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      box-shadow: 0px 4px 12px ${({ theme }): string => theme.boxShadow};
      border-radius: 6px;
      margin-top: 16px;
      padding: 12px;
      &:hover {
        background: none;
        backdrop-filter: none;
      }
    }
    tr > td {
      display: flex;
      flex: 1;
      width: 100%;
      justify-content: space-between;
      margin: 0;
      margin-bottom: 18px;
      min-height: 32px;
      span.span-inside-tooltip {
        align-items: flex-end;
        flex-direction: column;
        img {
          margin-left: 0;
        }
      }
    }
    .header-value {
      flex-wrap: wrap;
      text-align: end;
    }
    .span-copybtn-wrap {
      display: flex;
      flex-wrap: nowrap;
      span {
        display: flex;
        align-items: center;
      }
      .copy-text {
        display: none;
      }
    }
  }
  overflow: auto;
`

const HeaderTitle = styled.span`
  display: none;
  ${media.mediumDown} {
    font-weight: 600;
    align-items: center;
    display: flex;
    margin-right: 3rem;
    svg {
      margin-left: 5px;
    }
  }
`
const HeaderValue = styled.span`
  ${media.mediumDown} {
    flex-wrap: wrap;
    text-align: end;
  }
`

function getLimitPrice(order: Order, isPriceInverted: boolean): string {
  if (!order.buyToken || !order.sellToken) return '-'

  const calculatedPrice = getOrderLimitPrice({
    buyAmount: order.buyAmount,
    sellAmount: order.sellAmount,
    buyTokenDecimals: order.buyToken.decimals,
    sellTokenDecimals: order.sellToken.decimals,
    inverted: isPriceInverted,
  })

  return formatCalculatedPriceToDisplay(calculatedPrice, order.buyToken, order.sellToken, isPriceInverted)
}

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
}

export type Props = StyledUserDetailsTableProps & {
  orders: Order[] | undefined
  messageWhenEmpty?: string | React.ReactNode
}

interface RowProps {
  order: Order
  isPriceInverted: boolean
}

const RowOrder: React.FC<RowProps> = ({ order, isPriceInverted }) => {
  const {
    creationDate,
    buyToken,
    buyAmount,
    sellToken,
    sellAmount,
    kind,
    partiallyFilled,
    shortId,
    uid,
    filledPercentage,
  } = order
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

  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  const renderSpinnerWhenNoValue = (textValue: string): JSX.Element | void => {
    if (textValue === '-') return <Spinner spin size="1x" />
  }

  return (
    <tr key={shortId}>
      <td>
        <HeaderTitle>
          Order ID <HelpTooltip tooltip={tooltip.orderID} />
        </HeaderTitle>
        <HeaderValue>
          <RowWithCopyButton
            className="span-copybtn-wrap"
            textToCopy={uid}
            contentsToDisplay={
              <LinkWithPrefixNetwork to={`/orders/${order.uid}`} rel="noopener noreferrer" target="_self">
                {shortId}
              </LinkWithPrefixNetwork>
            }
          />
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Type</HeaderTitle>
        <span className="header-value">
          <TradeOrderType kind={kind} />
        </span>
      </td>
      <td>
        <HeaderTitle>Sell Amount</HeaderTitle>
        <HeaderValue>
          {renderSpinnerWhenNoValue(sellFormattedAmount) || (
            <TextWithTooltip textInTooltip={`${sellFormattedAmount} ${sellTokenSymbol}`}>
              {formattedAmount(sellToken, sellAmount.plus(order.feeAmount), FormatAmountPrecision.highPrecision)}{' '}
              {sellToken && network && <TokenDisplay showAbbreviated erc20={sellToken} network={network} />}
            </TextWithTooltip>
          )}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Buy amount</HeaderTitle>
        <HeaderValue>
          {renderSpinnerWhenNoValue(buyFormattedAmount) || (
            <TextWithTooltip textInTooltip={`${buyFormattedAmount} ${buyTokenSymbol}`}>
              {formattedAmount(buyToken, buyAmount, FormatAmountPrecision.highPrecision)}{' '}
              {buyToken && network && <TokenDisplay showAbbreviated erc20={buyToken} network={network} />}
            </TextWithTooltip>
          )}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>
          Limit price <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
        </HeaderTitle>
        <HeaderValue>{renderSpinnerWhenNoValue(limitPriceSettled) || limitPriceSettled}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Surplus</HeaderTitle>
        <HeaderValue>
          <OrderSurplusDisplayStyledByRow order={order} />
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Created</HeaderTitle>
        <HeaderValue>
          <DateDisplay date={creationDate} showIcon={true} />
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Status</HeaderTitle>
        <HeaderValue>
          <StatusLabel status={order.status} partiallyFilled={partiallyFilled} filledPercentage={filledPercentage} />
        </HeaderValue>
      </td>
    </tr>
  )
}

const OrdersUserDetailsTable: React.FC<Props> = (props) => {
  const { orders, showBorderTable = false, messageWhenEmpty } = props
  const [isPriceInverted, setIsPriceInverted] = useState(false)

  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  const orderItems = (items: Order[] | undefined): JSX.Element => {
    if (!items?.length)
      return (
        <tr className="row-empty">
          <td className="row-td-empty">
            <EmptyItemWrapper>{messageWhenEmpty || 'No orders.'}</EmptyItemWrapper>
          </td>
        </tr>
      )

    return (
      <>
        {items.map((item) => (
          <RowOrder key={item.shortId} order={item} isPriceInverted={isPriceInverted} />
        ))}
      </>
    )
  }

  return (
    <Wrapper
      showBorderTable={showBorderTable}
      header={
        <tr>
          <th>
            Order ID <HelpTooltip tooltip={tooltip.orderID} />
          </th>
          <th>Type</th>
          <th>Sell amount</th>
          <th>Buy amount</th>
          <th>
            Limit price <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
          </th>
          <th>Surplus</th>
          <th>Created</th>
          <th>Status</th>
        </tr>
      }
      body={orderItems(orders)}
    />
  )
}

export default OrdersUserDetailsTable
