import React, { useEffect, useState } from 'react'

import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { safeTokenName } from '@gnosis.pm/dex-js'
import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import Spinner from 'components/common/Spinner'
import StyledUserDetailsTable, {
  EmptyItemWrapper,
  Props as StyledUserDetailsTableProps,
} from 'components/common/StyledUserDetailsTable'
import { TokenDisplay } from 'components/common/TokenDisplay'
import TradeOrderType from 'components/common/TradeOrderType'
import Icon from 'components/Icon'
import { HelpTooltip } from 'components/Tooltip'
import { TextWithTooltip } from 'explorer/components/common/TextWithTooltip'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { FormatAmountPrecision, formatCalculatedPriceToDisplay, formattedAmount, getOrderLimitPrice } from 'utils'

import { Order } from 'api/operator'

import { OrderSurplusDisplayStyledByRow } from './OrderSurplusTooltipStyledByRow'

import { StatusLabel } from '../StatusLabel'
import { ScrollBarStyle } from '../../../explorer/styled'
import { WrapperUserDetailsTable } from '../../transaction/TransactionTable/styled'

const Wrapper = styled(WrapperUserDetailsTable)``

const HeaderValue = styled.span``

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

  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  const renderSpinnerWhenNoValue = (textValue: string): JSX.Element | void => {
    if (textValue === '-') return <Spinner spin size="1x" />
  }

  return (
    <tr key={uid}>
      <td>
        <HeaderValue>
          <RowWithCopyButton
            className="span-copybtn-wrap"
            textToCopy={uid}
            contentsToDisplay={
              <LinkWithPrefixNetwork to={`/orders/${order.uid}`} rel="noopener noreferrer" target="_self">
                <TruncatedText text={uid} />
              </LinkWithPrefixNetwork>
            }
          />
        </HeaderValue>
      </td>
      <td>
        <span className="header-value">
          <TradeOrderType kind={kind} />
        </span>
      </td>
      <td>
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
        <HeaderValue>{renderSpinnerWhenNoValue(limitPriceSettled) || limitPriceSettled}</HeaderValue>
      </td>
      <td>
        <HeaderValue>
          <OrderSurplusDisplayStyledByRow order={order} />
        </HeaderValue>
      </td>
      <td>
        <HeaderValue>
          <DateDisplay date={creationDate} showIcon={true} />
        </HeaderValue>
      </td>
      <td>
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
          <RowOrder key={item.uid} order={item} isPriceInverted={isPriceInverted} />
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
